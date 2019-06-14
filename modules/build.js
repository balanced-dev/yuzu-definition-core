var build = require('./build-internal');
var layoutService = require('./services/layoutService');
var renderService = require('./services/renderService');
var hbsService = require('./services/hbsService');
var fileService = require('./services/fileService');

var register = function(partialsRootDir, hbsHelpers) {

	hbsService.registerHelpers(hbsHelpers);
	hbsService.registerPartials(partialsRootDir);
}

const setup = function(partialsRootDir, layoutDir) {

	var externals = fileService.getDataAndSchema(partialsRootDir);
	if(layoutDir)
		externals.layouts = layoutService.GetLayouts(layoutDir);
	else
		externals.layouts = [];

	return externals;
}

const render = function(data, path, externals, errors) {

	var blockData = build.getBlockData(path);

	data = build.parseJson(data, path, errors);
	data = build.resolveJson(data, externals, blockData, errors);

	build.validateSchema(data, externals, blockData, errors);

	return renderService.fromTemplate(path, blockData.template, data, externals.layouts, errors, blockData.blockLayout);
}

const resolveDataString = function(data, path, externals, errors)
{
	data = build.parseJson(data, path, errors);
	data = build.resolveJson(data, externals, blockData, errors);

	return data
}

const resolveDataBlockName = function(partialsRootDir, blockName) {

	var externals = fileService.getDataAndSchema(partialsRootDir);

	if (externals.data.hasOwnProperty(blockName)) {
		var data = externals.data[blockName];

		data = build.resolveJson(data, externals);

		return data;
	}
	else {
		throw blockName +" block not found"
	}
}

const resolveDataAndRefMap = function(partialsRootDir, blockName) {

	var externals = fileService.getDataAndSchema(partialsRootDir);

	if (externals.data.hasOwnProperty(blockName)) {
		var data = externals.data[blockName];

		refmap = build.resolveSchemaAsDictionaryRefMap(data, externals);
		data = build.resolveJson(data, externals);

		return { 
			data: data, 
			map: refmap
		};
	}
	else {
		throw blockName +" block not found"
	}
}
		
module.exports = { 
	register,
	setup,
	render,
	resolveDataString,
	resolveDataBlockName,
	resolveDataAndRefMap
};