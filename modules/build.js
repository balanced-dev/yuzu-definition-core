var _ = require('lodash');
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

	var externals = fileService.getDataAndSchema(partialsRootDir, rootSchemaProperties);
	if (layoutDir)
		externals.layouts = layoutService.GetLayouts(layoutDir);
	else
		externals.layouts = [];

	return externals;
}

const render = function (data, path, externals, errors) {

	var blockData = build.getBlockData(path);

	data = build.parseJson(data, path, errors);
	data = build.resolveJson(data, externals, blockData, errors);

	build.validateSchema(data, externals, blockData, errors);

	return renderService.fromTemplate(path, blockData.template, data, externals.layouts, errors, blockData.blockLayout);
}

const renderPreview = function (data, refs, path, externals, errors) {

	Object.keys(refs).forEach(function (key) {
		externals.data[key] = refs[key];
	});

	return render(data, path, externals, errors);
}

const save = function (partialsRootDir, data, path, refs, errors) {

	fs.writeFileSync(path, data);

	var dataPaths = fileService.getDataPaths(partialsRootDir);
	//only save sublocks that are in the current graph
	var refmap = build.resolveDataAsListRefMap(JSON.parse(data), { data: refs });

	Object.keys(refs).forEach(function (key) {
		if (refmap.hasOwnProperty(key)) {
			var blockPath = dataPaths[key];
			if(!blockPath) blockPath = blockPathService.buildNewBlockPath(key, dataPaths);
			fs.writeFileSync(blockPath, JSON.stringify(refs[key], null, 4));
		}
	});

	var externals = fileService.getDataAndSchema(partialsRootDir);

	return render(data, path, externals, errors);

}

const resolveDataString = function (data, path, externals, errors) {
	data = build.parseJson(data, path, errors);
	data = build.resolveJson(data, externals, blockData, errors);

	return data
}

const getData = function (partialsRootDir, state) {

	var externals = fileService.getDataAndSchema(partialsRootDir);

	if (externals.data.hasOwnProperty(state)) {
		return externals.data[state];
	}
	else {
		throw state + " block state not found"
	}
}

const getChildStates = function (partialsRootDir, state) {

	var externals = fileService.getDataAndSchema(partialsRootDir);

	if (externals.data.hasOwnProperty(state)) {
		var data = externals.data[state];

		refmapData = build.resolveDataAsListRefMap(data, externals);

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

const getPreviews = function(partialsRootDir) {

	return fileService.getPreviews(partialsRootDir);
}


module.exports = {
	register,
	setup,
	render,
	renderPreview,
	save,
	resolveDataString,
	getData,
	getChildStates,
	getRefPaths,
	getEmpty,
	getPreviews
};