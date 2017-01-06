var Hbs = require('handlebars');
var walkSync = require('../modules/walkSync');
var fs = require('fs');
var path = require('path');

function getName(str) {
	return str.split('\\').pop().split('/').pop();
}

var getPartials = function(files)
{
	var partialsDir = files.templatePartials,
	filenames = [],
	batchMatches = [];
	
	walkSync(partialsDir, function(dir, filename) { 
		if(path.extname(filename) == ".hbs") 
			filenames.push(dir + filename); 
	});
	
	filenames.forEach(function(filename) {

		var matches = /.hbs$/.exec(filename);
		
		var templateName = matches['input'],
			path = templateName.substring(0, templateName.lastIndexOf("/")),
			name = filename.substring(0, filename.lastIndexOf(".")),
			template = fs.readFileSync(templateName, 'utf8');

		batchMatches.push(path)

		/*		console.log('templateName', templateName)
				console.log('path', path)
				console.log('name', name)
				console.log('template', template)*/

		Hbs.registerPartial(name, template);
	});	
	
	return batchMatches;
}

module.exports = getPartials;