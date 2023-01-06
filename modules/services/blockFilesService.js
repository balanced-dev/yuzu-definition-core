var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var jsonHelper = require('../json/jsonService');
var errorSvc = require('./errorService');
var errorSource = 'Gather template files';

function Get(blockPath, errors)
{
	var dir = path.join(path.dirname(blockPath), '/..');
	
	var files = fs.readdirSync(dir);
	var dataObject = {};
	dataObject.path = dir;
	dataObject.name = dir.split(path.sep).pop();
	
	files.forEach(function(dirFile) {
		TestAndReadFile(dataObject, files, dir, dirFile, errors, 'markup', 'StaticContent', '.html');
		TestAndReadFile(dataObject, files, dir, dirFile, errors, 'template', 'Handlebars', '.hbs');
        TestAndReadFile(dataObject, files, dir, dirFile, errors, 'blockLayout', 'Block Layout', '.layout');
		TestAndReadFile(dataObject, files, dir, dirFile, errors, 'schema', 'Json Schema', '.schema', true);
	});
	
	return dataObject;
}

function GetFiles(blockPath)
{
	var dir = path.join(path.dirname(blockPath), '/..');
	
	var files = fs.readdirSync(dir);
	var dataObject = [];
	
	files.forEach(function(dirFile) {
		var ext = path.extname(dirFile);

		if(ext === '.hbs' || ext === '.layout' || ext === '.schema') {
			dataObject.push(path.join(dir, dirFile));
		}
	});
	
	return dataObject;
}

function TestAndReadFile(dataObject, files, dir, dirFile, errors, key, name, ext, validate)
{
	if(_.filter(files, function(i) { return path.extname(i) == ext }).length > 1){
		errorSvc.AddError(errors, errorSource, 'More than one '+ name +' file found');
		return;		
	}
	var filename = path.join(dir, dirFile);	
	if(path.extname(dirFile) == ext) {
		var fileContent = fs.readFileSync(filename, 'utf8');
		if(validate)
		{
			var data = jsonHelper.testJSON(fileContent, errors);
			if(errors.length > 0) {
				errorSvc.AddError(errors, errorSource, 'Cannot parse file : '+ dirFile);	
				return;
			}
			if(data.properties && data.type == "object") {
				data.properties['_modifiers'] = { "type": "string" };
			}
			dataObject[key] = data;		
		}
		else
			dataObject[key] = fileContent;	
	}
}

module.exports.Get = Get;
module.exports.GetFiles = GetFiles;