var fs = require('fs');
var path = require('path');
var _ = require('lodash');

function GetLayouts(dir)
{
	var layouts = [];
	var files = fs.readdirSync(dir);
	
	files.forEach(function(filename) {
		
		if(filename.endsWith('.hbs')) {

			var templatePath = path.join(dir, filename);
			var template = fs.readFileSync(templatePath, 'utf8');

			var layoutName = path.basename(filename, '.hbs');			
			var dataPath = path.join(dir, layoutName +'.json');
			var data = fs.readFileSync(dataPath, 'utf8');

			if(template && data) {
				layouts.push({
					name: layoutName,
					template: template,
					data: JSON.parse(data)
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

module.exports.GetLayoutName = GetLayoutName;
module.exports.GetLayouts = GetLayouts;
module.exports.GetLayout = GetLayout;
module.exports.GetBlockLayout = GetBlockLayout;