var gutil = require('gulp-util');
var through = require('through2');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var extend = require('util-extend');
var jsonHelper = require('../modules/jsonHelper');

function GetTemplateSettings(file)
{
	var dir = path.join(path.dirname(file.path), '/..');
	
	var files = fs.readdirSync(dir);
	var dataObject = {};
	dataObject.path = dir;
	
	files.forEach(function(dirFile) {
		TestAndReadFile(dataObject, files, dir, dirFile, 'template', 'Handlebars', '.hbs');
        TestAndReadFile(dataObject, files, dir, dirFile, 'blockLayout', 'Block Layout', '.layout');
		TestAndReadFile(dataObject, files, dir, dirFile, 'schema', 'Json Schema', '.schema', true);
	});
	
	return dataObject;
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

		var parseResults = jsonHelper.testJSON(file.contents.toString())
		if(!parseResults.valid) {
			this.emit('error', new gutil.PluginError('Find template and validate error', 'JSON Error for '+ file.path +', '+ parseResults.error));
			return cb();
		}
		
		var resolveResults = jsonHelper.resolveComponentJson(file.path, parseResults.data, externalDatas);
		if(!resolveResults.valid) {
			this.emit('error', new gutil.PluginError('Find template and validate error', resolveResults.errors[0]));
			return cb();
		}

		var dataObject = GetTemplateSettings(file);
		if(dataObject.error) {
			this.emit('error', new gutil.PluginError('Find template and validate error', dataObject.error));
			return cb();
		}

		if(!dataObject.schema) {
			this.emit('error', new gutil.PluginError('Find template and validate error', 'Schema file not found in the parent directory for '+ dataObject.path));
			return cb();			
		}
		else{

			var result = jsonHelper.validateSchema(externalSchemas, parseResults, dataObject)
			if(result.errors.length > 0) {
				this.emit('error', new gutil.PluginError('Find template and validate error', 'validation on '+ dataObject.path +' : '+ result.errors[0].message +' for '+ result.errors[0].schema));
				return cb();	
			}
			else
				file.validated = true;
		}

		file.contents = new Buffer(dataObject.template);
		file.layout = GetLayoutName(file.path);	
		file.path = file.path.replace('.json', '.hbs');
        if(dataObject.blockLayout != undefined)
            file.blockLayout = 	dataObject.blockLayout;
		parseResults.data.json = JSON.stringify(parseResults.data, null, 4);
		file.data = extend(parseResults.data);

		this.push(file);
		cb();
	});
}

module.exports = findTemplateAndValidate;