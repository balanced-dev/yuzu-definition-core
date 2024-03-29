var _ = require('lodash');
var fs = require('fs');
var build = require('./build-internal');
var jsonService = require('./json/jsonService');
var layoutService = require('./services/layoutService');
var renderService = require('./services/renderService');
var hbsService = require('./services/hbsService');
var fileService = require('./services/fileService');
var blockPathService = require('./services/blockPathService');

var register = function (partialsRootDir, hbsHelpers) {

	hbsService.registerHelpers(hbsHelpers);
	hbsService.registerPartials(partialsRootDir);
}

const setup = function (partialsRootDir, layoutDir, rootSchemaProperties) {

	var errors = [];
	var externals = fileService.getDataAndSchema(partialsRootDir, rootSchemaProperties);
	if (layoutDir)
		externals.layouts = layoutService.GetLayouts(layoutDir, externals, errors);
	else
		externals.layouts = [];

	return externals;
}

const getBlockFiles = function(path) {

	return build.getBlockFiles(path);
}

const getFilenamesInDirs = function(dirs) {

	return fileService.getFilenamesInDirs(dirs);
}

const resolveDataString = function (data, path, externals, errors) {

	var blockData = build.getBlockData(path, errors);

	data = build.parseJson(data, errors);
	data = build.resolveJson(data, externals, blockData, errors);

	return data
}

const resolveSchema = function (schema, externals) {

	return build.resolveSchemaRemoveAnyOf(JSON.parse(schema), externals);
}

const resolvePaths = function (schema, externals, filePath) {

	return build.resolveSchemaAsPathsRefMap(JSON.parse(schema), externals, filePath);
}

const render = function (data, path, externals, errors) {

	var blockData = build.getBlockData(path, errors);

	var layoutProperty = layoutService.property;
	if(blockData.schema && blockData.schema.properties) {
		blockData.schema.properties[layoutProperty.name] = layoutProperty.schema;
	}

	//if the schema is missing try and find from externals
	if(!blockData.schema) {
		if(Object.keys(externals.schema).includes(`/par${capitalize(blockData.name)}`)) {
			blockData.schema = externals.schema[`/par${capitalize(blockData.name)}`];
		}
		else if(Object.keys(externals.schema).includes(`/${blockData.name}`)) {
			blockData.schema = externals.schema[`/${blockData.name}`];
		}
	}

	data = build.parseJson(data, errors);
	data = build.resolveJson(data, externals, blockData, errors);

	if(_.some(errors)) return '';
	
	build.validateSchema(data, externals, blockData, errors);

	if(_.some(errors)) return '';

	return renderService.fromTemplate(path, blockData, data, externals.layouts, errors);
}

const renderState = function (partialsRootDir, state, errors) {

	var externals = fileService.getDataAndSchema(partialsRootDir);
	externals.layouts = [];

	if (externals.data.hasOwnProperty(state)) {
		var data = externals.data[state];
		var paths = fileService.getDataPaths(partialsRootDir);
		var path = paths[state];

		var blockData = build.getBlockData(path, errors);
		data = build.resolveJson(data, externals, blockData, errors);
	
		return renderService.fromTemplate(path, blockData, data, externals.layouts, errors);
	}
	else {
		throw state + " block state not found"
	}
}

const renderPreview = function (data, refs, path, externals, errors) {

	Object.keys(refs).forEach(function (key) {
		externals.data[key] = refs[key];
	});

	var blockData = build.getBlockData(path, errors);

	data = build.parseJson(data, errors);
	data = build.resolveJson(data, externals, blockData, errors);

	return renderService.fromTemplate(path, blockData, data, externals.layouts, errors);
}

const save = function (partialsRootDir, data, path, refs) {

	fs.writeFileSync(path, data);

	var dataPaths = fileService.getDataPaths(partialsRootDir);
	//only save sublocks that are in the current graph
	var refmap = build.resolveDataAsListRefMap(JSON.parse(data), { data: refs });

	//write out used refs to their files
	Object.keys(refs).forEach(function (key) {
		if (refmap.hasOwnProperty(key)) {
			var blockPath = dataPaths[key];
			if(!blockPath) blockPath = blockPathService.buildNewBlockPath(key, dataPaths);
			fs.writeFileSync(blockPath, JSON.stringify(refs[key], null, 4));
		}
	});

}

const savePreview = function (path, template) {
	fs.writeFileSync(path, template);
}

const getPreviews = function(files, path) {

	return fileService.getPreviewsFileList(files, path);
}

const getData = function (partialsRootDir, state, resolve, errors) {

	var externals = fileService.getDataAndSchema(partialsRootDir);

	if (externals.data.hasOwnProperty(state)) {
		var data = externals.data[state];
		if(resolve) {
			var paths = fileService.getDataPaths(partialsRootDir);
			var path = paths[state];
	
			var blockData = build.getBlockData(path, errors);
			data = build.resolveJson(data, externals, blockData, errors);
		}
		return (data);
	}
	else {
		return jsonService.getEmpty(state, externals);
	}
}

const getChildStates = function (partialsRootDir, state) {

	var externals = fileService.getDataAndSchema(partialsRootDir);

	if (externals.data.hasOwnProperty(state)) {
		var data = externals.data[state];

		refmapData = build.resolveDataAsObjectRefMap(data, externals);

		return refmapData;
	}
	else {
		throw state + " block state not found"
	}
}

const getRefPaths = function (partialsRootDir, block) {

	var externals = fileService.getDataAndSchema(partialsRootDir);

	if (externals.schema.hasOwnProperty(block)) {
		var schema = externals.schema[block];
		return build.resolveSchemaAsPathsRefMap(schema, externals);
	}
	else {
		throw state + " block state not found"
	}
}

const getEmpty = function (partialsRootDir, blockName, path) {

	var externals = fileService.getDataAndSchema(partialsRootDir);

	return jsonService.getEmpty(blockName, externals, path);
}

const getFilePaths = function (dir, fileTypes = []) {
	return fileService.getFilePaths(dir, fileTypes);
}

function capitalize(s)
{
    return s[0].toUpperCase() + s.slice(1);
}

module.exports = {
	register,
	setup,
	render,
	renderState,
	renderPreview,
	save,
	savePreview,
	resolveDataString,
	resolvePaths,
	resolveSchema,
	getBlockFiles,
	getFilenamesInDirs,
	getData,
	getChildStates,
	getRefPaths,
	getEmpty,
	getPreviews,
	getFilePaths
};