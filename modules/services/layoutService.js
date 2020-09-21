var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var fileService = require('./fileService');
var jsonService = require('../json/jsonService');

const property = {
	name: '_layout',
	schema: {
		"type": "object",
		"properties": {
			"name": {
				"type": "string"
			},
			"data": {
				"type": "string"
			}
		}
	}
};

function GetLayouts(partialsDir, externals, errors)
{
	var layouts = [];
	
	fileService.getFilesInDir(partialsDir, function (dir, filename) {
		if(path.extname(filename) == ".hbs") {

            var layoutName = path.basename(filename, '.hbs');         

			var templatePath = path.join(dir, filename);
			var template = fs.readFileSync(templatePath, 'utf8');
			
			var dataItems = [];
			var dataFiles = fs.readdirSync(path.join(dir, 'data'));
			dataFiles.forEach(function(dataFilename) {
				var dataPath = path.join(dir, 'data', dataFilename);

				var fileContents = fs.readFileSync(dataPath, 'utf8');
				data = jsonService.testJSON(fileContents, errors);
				jsonService.resolveComponentJson(data, errors, { external: externals.data, addRefProperty: true, deepclone: true });

				dataItems.push({
					name: path.basename(dataFilename, '.json'),
					value: data
				});
			});

			if(template && dataItems && dataItems.length > 0) {
				layouts.push({
					name: layoutName,
					template: template,
					data: dataItems
				})
			}
		}
		
	}, function(dir) {});

	return layouts;
}

function GetSelectedLayout(blockPath, data)
{
	var dirs = path.dirname(blockPath).split(path.sep);
	var isLayout = _.find(dirs, function(o) { return o == "_layouts"; }) != undefined;
	if(isLayout) return undefined;

    var isBlock = _.find(dirs, function(o) { return o == "blocks"; }) != undefined;
	var layout = isBlock ? { name: '_block', data: '_block' } : { name: '_page', data: '_page' } ;

    if(data && data._layout) {
		return data._layout;
	}
            
	return layout;
}

function GetLayout(path, layouts, data) {
	var selectedLayout = GetSelectedLayout(path, data);

	if(selectedLayout) {
		var layout = _.chain(layouts).filter( function(layout) {
			return layout.name == selectedLayout.name;
		}).first().value();

		if(layout) {
			var layoutData = _.chain(layout.data).filter( function(data) {
				return data.name == selectedLayout.data;
			}).first().value();

			if(layoutData) {
				return {
					template: layout.template,
					data: layoutData.value
				}
			}
		}
	}
	return undefined;
}

module.exports.GetSelectedLayout = GetSelectedLayout;
module.exports.GetLayouts = GetLayouts;
module.exports.GetLayout = GetLayout;
module.exports.property = property;