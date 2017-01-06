var walkSync = require('../modules/walkSync');
var fs = require('fs');
var path = require('path');

function getName(str) {
	return str.split('\\').pop().split('/').pop();
}

var getExternals = function(files)
{
	var partialsDir = files.templatePartials,
	externalSchemas = {}, externalDatas = {};
	
	walkSync(partialsDir, function(dir, filename) { 
		var dirFilename = path.join(dir, filename);
		if(path.extname(filename) == ".schema") 
			try {
				externalSchemas[getFilename(filename)] = JSON.parse(fs.readFileSync(dirFilename, 'utf8'));		
			}
			catch (e) {
				console.log("File not parsed "+ filename)
			}
		if(path.extname(filename) == ".json") 
			try {
				externalDatas[getFilename(filename)] = JSON.parse(fs.readFileSync(dirFilename, 'utf8'));
			}	
			catch (e) {
				console.log("File not parsed "+ filename)
			}					
	});
	
	var output = {};
	output.schema = externalSchemas;
	output.data = externalDatas;
	return output;
}

function getFilename(filename)
{
	return '/'+ filename.replace(path.extname(filename), "")
}

module.exports = getExternals;