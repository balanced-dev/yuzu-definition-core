var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var jsonHelper = require('../jsonHelper/jsonHelper');

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

function GetLayouts(dir)
{
	var layouts = [];
	var files = fs.readdirSync(dir);
	
	files.forEach(function(filename) {
		
		if(filename.endsWith('.hbs')) {
			var layoutName = path.basename(filename, '.hbs');

			var templatePath = path.join(dir, filename);
			var template = fs.readFileSync(templatePath, 'utf8');

			var dataPath = path.join(dir, layoutName +'.json');
			var data = fs.readFileSync(dataPath, 'utf8');

			if(template && data) {
				layouts.push({
					name: layoutName,
					template: template,
					data: data
				})
			}
		}
	});
	
	return layouts;
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

function GetLayout(path, layouts) {
	var layoutName = GetLayoutName(path);

	return _.chain(layouts).filter( function(layout) {
		return layout.name == layoutName;
	}).first().value();
}

function GetBlockLayout(blockLayout) {
	var template = fs.readFileSync(blockLayout, 'utf8');

	return {
		template: template,
		data: {}
	}
}

module.exports.GetTemplateSettings = GetTemplateSettings;
module.exports.GetLayouts = GetLayouts;
module.exports.GetLayout = GetLayout;
module.exports.GetBlockLayout = GetBlockLayout;