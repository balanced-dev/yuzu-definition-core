var gutil = require('gulp-util');
var through = require('through2');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var extend = require('util-extend');
var jsonHelper = require('../modules/jsonHelper');

function GetTemplateSettings(file, externalDatas, externalSchemas)
{
	var dir = path.dirname(file.path);
	
	var files = fs.readdirSync(dir);
	var dataObject = {};
	dataObject.path = dir;
	
	files.forEach(function(dirFile) {
		TestAndReadFile(dataObject, files, dir, dirFile, 'template', 'Handlebars', '.hbs');
        TestAndReadFile(dataObject, files, dir, dirFile, 'blockLayout', 'Block Layout', '.layout');
		TestAndReadFile(dataObject, files, dir, dirFile, 'schema', 'Json Schema', '.schema', true);
	});
	
    if(dataObject.error == undefined)
        BuildJson(dir, dataObject, externalDatas, externalSchemas);
    
	return dataObject;
}

function BuildJson(dir, dataObject, externalDatas, externalSchemas)
{
    var dataDir = path.join(dir, '/data');
   	var files = fs.readdirSync(dataDir); 
    dataObject.data = [];

    if(!dataObject.schema) {
        dataObject.error = 'Schema file not found in the parent directory for '+ dataObject.path;
        return;			
    } 

    files.forEach(function(dataFile) {

        var filename = path.join(dataDir, dataFile);	
        var dataContent = fs.readFileSync(filename, 'utf8');

    	var parseResults = jsonHelper.testJSON(dataContent.toString());
		if(!parseResults.valid) {
			dataObject.error = 'JSON Error for '+ dataFile.path +', '+ parseResults.error;
			return;
		}
        
		var resolveResults = jsonHelper.resolveComponentJson(dataFile.path, parseResults.data, externalDatas);
		if(!resolveResults.valid) {
			dataObject.error = resolveResults.errors[0];
			return;
		}  
          
       	var schemaResult = jsonHelper.validateSchema(externalSchemas, parseResults, dataObject)
        if(schemaResult.errors.length > 0) {
            dataObject.error = 'validation on '+ dataObject.path +' : '+ schemaResult.errors[0].message +' for '+ schemaResult.errors[0].schema;
            return;	
        }
        else {
           dataObject.data.push(parseResults.data);   
        }
    });
}

function TestAndReadFile(dataObject, files, dir, dirFile, key, name, ext, validate)
{
	if(_.filter(files, function(i) { return path.extname(i) == ext }).length > 1){
		dataObject.error = 'More than one '+ name +' file found at '+ dir;	
		return;		
	}
	var filename = path.join(dir, dirFile);	
	if(path.extname(dirFile) == ext) {
		var fileContent = fs.readFileSync(filename, 'utf8');
		if(validate)
		{
			var result = jsonHelper.testJSON(fileContent);
			if(!result.valid) {
				dataObject.error = 'Cannot parse file : '+ name +' in '+ dir;	
				return;
			}
			dataObject[key] = result.data;		
		}
		else
			dataObject[key] = fileContent;	
	}
}

function GetLayoutName(p)
{
	var layout = 'layout';
	var paths = path.basename(p).split('.');
    var dirs = path.dirname(p).split(path.sep);
    var isBlock = _.find(dirs, function(o) { return o == "blocks"; }) != undefined;
    
    if(isBlock)
        layout = 'block';
    else
        if(paths.length == 3)
            layout = paths[1];
            
	return layout;
}

function findTemplateAndValidate(externalSchemas, externalDatas) {

	return through.obj(function (file, enc, cb) {

		if (file.isNull()) {
			this.push(file);
			return cb();
		}
		
		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('Find template and validate error', 'Streaming not supported'));
			return cb();
		}

		file.validated = false;

		var dataObject = GetTemplateSettings(file, externalDatas, externalSchemas);
		if(dataObject.error) {
			this.emit('error', new gutil.PluginError('Find template and validate error', dataObject.error));
			return cb();
		}

		file.contents = new Buffer(file);
		file.layout = GetLayoutName(file.path);	
        if(dataObject.blockLayout != undefined)
            file.blockLayout = 	dataObject.blockLayout;
		file.data = extend(dataObject.data);

		this.push(file);
		cb();
	});
}

module.exports = findTemplateAndValidate;