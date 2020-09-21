var fs = require('fs');
var path = require('path');
var _ = require("lodash");
const { ENGINE_METHOD_PKEY_ASN1_METHS } = require('constants');

var getDataAndSchema = function (partialsDirs, rootSchemaProperties) {
	externalSchemas = {}, externalDatas = {};

	partialsDirs.forEach(function(partialsDir){
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
	});

	var output = {};
	output.schema = externalSchemas;
	output.data = externalDatas;
	return output;
}

var getPreviews = function (previewsDir) {
	var output = {}

	try {
		getFilesInDir(previewsDir, function (dir, filename) {
			dir = dir.replace(previewsDir, ""); 
			var filePath = path.join(dir, filename);
			var objPath = path.join(dir, path.basename(filename, '.html'));
	
			var arrPath = objPath.split(path.sep);
			var blockPosition = arrPath.length - 1;
			arrPath[blockPosition] = "/"+ arrPath[blockPosition];
	
			objPath = arrPath.join('.');
	
			_.set(output, objPath, filePath);
			
		}, function(dir) {
			dir = dir.replace(previewsDir, ""); 
			dir = dir.substring(0, dir.length - 1).replace(new RegExp("/", 'g'), ".");
			if(dir && !_.has(output, dir)) {
				_.set(output, dir, {});
			}
		});
	}
	catch(err) {}

	return output;
}

var getPreviewsFileList = function (files) {
	var output = {}

	files.forEach((item) => {

		let arr = item.split(path.sep);
		let indexAtRoot = _.indexOf(arr, '_templates') + 1;
		arr = arr.slice(indexAtRoot);
		arr = arr.filter(item => item !== 'data');

		let index = 1;
		let type = arr[0];
		let area = arr.length > 3 ? arr.slice(1, arr.length -2).join('/') : '';

		arr.forEach((item) => {

			let currentPath = arr.slice(0, index);

			let exists = _.has(output, currentPath);
			let isFile = item.includes('.');

			if(!isFile && !exists) {
				_.set(output, currentPath, {})
			}
			else if (isFile) {
				let fileName = path.basename(item, '.json');

				let fileSplit = fileName.startsWith('_') ? [fileName] : fileName.split('_');
				
				let name = fileSplit[0].replace('par', '');
				let state = fileSplit.length > 1 ? fileSplit[1] : '';

				currentPath[currentPath.length-1] = `/${fileName}`;

				let qs = `?type=${type}`;
				if(area) qs = qs + `&area=${area}`;
				if(name) qs = qs + `&name=${name}`;
				if(state) qs = qs + `&state=${state}`;

				_.set(output, currentPath, qs);
			}

			index ++;

		});

	});

	return output;
}

var getDataPaths = function (partialsDirs) {
	output = {};

	partialsDirs.forEach(function(partialsDir){
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
	});

	return output;
}

function getFilenamesInDirs(dirs) 
{
	var files = []

	dirs.forEach(d => {
		getFilesInDir(d, function (dir, filename) {
			files.push(path.resolve(path.join(dir, filename)));
		}, function(dir) {});
	});

	return files;
}

const getFilePaths = function (dir, fileTypes) {
	var output = [];
	getFilesInDir(dir, function (dir, filename) {
		var dirFilename = path.join(dir, filename);
		if(fileTypes.length < 1 || fileTypes.indexOf(path.extname(filename)) > -1)
			try {
				output.push(dirFilename);
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
	getPreviewsFileList,
	getFilenamesInDirs,
	getDataPaths,
	getFilePaths,
	getFilesInDir
};