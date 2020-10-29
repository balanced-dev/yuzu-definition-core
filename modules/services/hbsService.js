var fileService = require('./fileService');
var highlightService = require('./blockHighlightService');
var fs = require('fs');
var path = require('path');

var setPartials = function(partialsDirs)
{
	filenames = [];
	handlebars.markup = {};
	
	partialsDirs.forEach(function(partialsDir) {
		fileService.getFilesInDir(partialsDir, function(dir, filename) { 
			var ext = path.extname(filename);
			if(ext == ".hbs" || ext == ".html") 
				filenames.push(dir + filename); 
		});
	});
	
	filenames.forEach(function(filename) {

		var ext = path.extname(filename);

		var templateName = path.basename(filename, ext);
		var template = fs.readFileSync(filename, 'utf8');

		if(ext == '.hbs') {
			template = highlightService.addYuzuMarker(template);
			handlebars.registerPartial(templateName, template);
		}
		else if(ext == '.html') {
			handlebars.markup[templateName] = template;
		}

		handlebars.registerPartial(templateName, template);
	});	
}

var setHelpers = function(helpers)
{
	if(!helpers)
		throw "Hbs Helpers not found, check they have been sent to gulp build";
	Object.keys(helpers).forEach(function(key) {
		handlebars.registerHelper(key, helpers[key])
	});
}

module.exports.registerPartials = setPartials;
module.exports.registerHelpers = setHelpers;