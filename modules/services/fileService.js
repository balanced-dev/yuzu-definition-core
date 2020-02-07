var fs = require('fs');
var path = require('path');
var _ = require("lodash");

var getDataAndSchema = function (partialsDir, rootSchemaProperties) {
	externalSchemas = {}, externalDatas = {};

	getFilesInDir(partialsDir, function (dir, filename) {
		var dirFilename = path.join(dir, filename);
		if (path.extname(filename) == ".schema")
			try {
				var schema = JSON.parse(fs.readFileSync(dirFilename, 'utf8'));
				if(schema.type === undefined) {
					console.warn("Schema "+ schema.id +" must have a schema type");
				} 
				if(rootSchemaProperties && schema.properties && schema.type == "object") {
					rootSchemaProperties.forEach(function(item) {
						schema.properties[item.name] = item.schema;
					});
				}
				externalSchemas[getFilename(filename)] = schema;
			}
			catch (e) {
				//console.log("File not parsed :" + filename)
			}
		if (path.extname(filename) == ".json")
			try {
				externalDatas[getFilename(filename)] = JSON.parse(fs.readFileSync(dirFilename, 'utf8'));
			}
			catch (e) {
				//console.log("File not parsed " + filename)
			}
	});

	var output = {};
	output.schema = externalSchemas;
	output.data = externalDatas;
	return output;
}

var getPreviews = function (partialsDir) {
	var output = {}

	try {
		getFilesInDir(partialsDir, function (dir, filename) {
			dir = dir.replace(partialsDir, ""); 
			var filePath = path.join(dir, filename);
			var objPath = path.join(dir, path.basename(filename, '.html'));
	
			var arrPath = objPath.split(path.sep);
			var blockPosition = arrPath.length - 1;
			arrPath[blockPosition] = "/"+ arrPath[blockPosition];
	
			objPath = arrPath.join('.');
	
			_.set(output, objPath, filePath);
			
		}, function(dir) {
			dir = dir.replace(partialsDir, ""); 
			dir = dir.substring(0, dir.length - 1).replace(new RegExp("/", 'g'), ".");
			if(dir && !_.has(output, dir)) {
				_.set(output, dir, {});
			}
		});
	}
	catch(err) {}

	return output;
}

var getDataPaths = function (partialsDir) {
	output = {};

	getFilesInDir(partialsDir, function (dir, filename) {
		var dirFilename = path.join(dir, filename);
		if (path.extname(filename) == ".json")
			try {
				output[getFilename(filename)] = dirFilename;
			}
			catch (e) {
				console.log("File not parsed " + filename)
			}
	});

	return output;
}

function getFilename(filename) {
	return '/' + filename.replace(path.extname(filename), "")
}

function getFilesInDir(dir, fileAction, dirAction) {

	if (dir[dir.length - 1] != '/') dir = dir.concat('/')

	var files = fs.readdirSync(dir);
	files.forEach(function (file) {
		if (fs.statSync(dir + file).isDirectory()) {
			if(dirAction) dirAction(dir);
			getFilesInDir(dir + file + '/', fileAction);
		} else {
			fileAction(dir, file);
		}
	});
}

module.exports = {
	getDataAndSchema,
	getPreviews,
	getDataPaths,
	getFilesInDir
};