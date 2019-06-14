var fileService = require('./fileService');
var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');

var setPartials = function(partialsDir)
{
	filenames = [];
	
	fileService.getFilesInDir(partialsDir, function(dir, filename) { 
		if(path.extname(filename) == ".hbs") 
			filenames.push(dir + filename); 
	});
	
	filenames.forEach(function(filename) {

		var templateName = path.basename(filename, '.hbs');
		var template = fs.readFileSync(filename, 'utf8');

		handlebars.registerPartial(templateName, template);
	});	
}

var setHelpers = function(helpers)
{
	
	Object.keys(helpers).forEach(function(key) {
		handlebars.registerHelper(key, helpers[key])
	});

}

module.exports.registerPartials = setPartials;
module.exports.registerHelpers = setHelpers;