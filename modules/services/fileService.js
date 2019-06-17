var fs = require('fs');
var path = require('path');

var getDataAndSchema = function (partialsDir) {
	externalSchemas = {}, externalDatas = {};

	getFilesInDir(partialsDir, function (dir, filename) {
		var dirFilename = path.join(dir, filename);
		if (path.extname(filename) == ".schema")
			try {
				externalSchemas[getFilename(filename)] = JSON.parse(fs.readFileSync(dirFilename, 'utf8'));
			}
			catch (e) {
				console.log("File not parsed " + filename)
			}
		if (path.extname(filename) == ".json")
			try {
				externalDatas[getFilename(filename)] = JSON.parse(fs.readFileSync(dirFilename, 'utf8'));
			}
			catch (e) {
				console.log("File not parsed " + filename)
			}
	});

	var output = {};
	output.schema = externalSchemas;
	output.data = externalDatas;
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

function getFilesInDir(dir, fileAction) {

	if (dir[dir.length - 1] != '/') dir = dir.concat('/')

	var files = fs.readdirSync(dir);
	files.forEach(function (file) {
		if (fs.statSync(dir + file).isDirectory()) {
			getFilesInDir(dir + file + '/', fileAction);
		} else {
			fileAction(dir, file);
		}
	});
}

module.exports = {
	getDataAndSchema,
	getDataPaths,
	getFilesInDir
};