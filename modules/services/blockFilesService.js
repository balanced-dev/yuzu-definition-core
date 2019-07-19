var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var jsonHelper = require('../json/jsonService');

function Get(blockPath)
{
	var dir = path.join(path.dirname(blockPath), '/..');
	
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
				dataObject.error = 'Cannot parse file : '+ dirFile +' in '+ dir;	
				return;
			}
			var data = result.data;
			if(data.properties && data.type == "object") {
				data.properties['@modifier'] = { "type": "string" };
			}
			dataObject[key] = data;		
		}
		else
			dataObject[key] = fileContent;	
	}
}

module.exports.Get = Get;