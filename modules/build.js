var jsonHelper = require('./jsonHelper/jsonHelper');
var refMapperDictionary = require('./jsonHelper/services/refsAsDictionary');

var templateHelper = require('./templateHelper/templateHelper');
var layoutHelper = require('./layoutHelper/layoutHelper');
var renderHelper = require('./renderHelper/renderHelper');
var registerHandlebarsPartials = require('./registerHandlebarsPartials');
var getExternals = require('./getExternals');

var register = function(partialsRootDir, hbsHelpers) {

	registerHandlebarsPartials.register.helpers(hbsHelpers);
	registerHandlebarsPartials.register.partials(partialsRootDir);
}

const setup = function(partialsRootDir, layoutDir) {

	var externals = getExternals(partialsRootDir);
	if(layoutDir)
		externals.layouts = layoutHelper.GetLayouts(layoutDir);
	else
		externals.layouts = [];

	return externals;
}

const render = function(data, path, externals, errors) {

	var blockData = getBlockData(path);

	data = parseJson(data, path, errors);
	data = resolveJson(data, externals, blockData, errors);

	validateSchema(data, externals, blockData, errors);

	return renderHelper.fromTemplate(path, blockData.template, data, externals.layouts, errors, blockData.blockLayout);
}

const resolveDataString = function(data, path, externals, errors)
{
	data = parseJson(data, path, errors);
	data = resolveJson(data, externals, blockData, errors);

	return data
}

const resolveDataBlockName = function(partialsRootDir, blockName) {

	var externals = getExternals(partialsRootDir);

	if (externals.data.hasOwnProperty(blockName)) {
		var data = externals.data[blockName];

		data = resolveJson(data, externals);

		return data;
	}
	else {
		throw blockName +" block not found"
	}
}

const resolveDataAndRefMap = function(partialsRootDir, blockName) {

	var externals = getExternals(partialsRootDir);

	if (externals.data.hasOwnProperty(blockName)) {
		var data = externals.data[blockName];
		var schema = externals.schema[blockName];

		refmap = resolveSchemaAsDictionaryRefMap(data, externals);
		data = resolveJson(data, externals);

		return { 
			data: data, 
			map: refmap
		};
	}
	else {
		throw blockName +" block not found"
	}
}


/*private*/
const parseJson = function(fileContents, path, errors)
{
	var results = jsonHelper.testJSON(fileContents);
	if(!results.valid) {
		errors.push({
			source: 'yuzu build - json parse',
			inner: 'JSON Error for '+ path +', '+ results.error
		})
	}
	return results.data;
}

const resolveJson = function(data, externals, blockData, errors)
{
	var resolveResults = jsonHelper.resolveComponentJson(data, { external: externals.data });
	if(!resolveResults.valid) {
		var that = this;
		resolveResults.errors.forEach(function(error) {
			errors.push({
				source: 'yuzu build - json resolve for '+ blockData.schema.id,
				inner: error
			})
			that.emit('error', new gutil.PluginError('Resolve Map Ref for '+ blockData.schema.id, error));
		});
	}
	return data;
}

const resolveSchemaAsDictionaryRefMap = function(schema, externals) {

	var results = jsonHelper.resolveComponentJson(schema, { external: externals.data, refMapper: refMapperDictionary, deepclone: true });
	return results.refMap;
}

const getBlockData = function(path) {

	var blockData = templateHelper.GetTemplateSettings(path);
	if(blockData.error) {
		errors.push({
			source: 'yuzu build - build template settings',
			inner: blockData.error
		})
	}
	return blockData;

}

const validateSchema = function(data, externals, blockData, errors) {
	if(!blockData.schema) {
		errors.push({
			source: 'yuzu build - schema not found : '+ path.basename(blockData.path),
		})			
	}
	else{

		var result = jsonHelper.validateSchema(externals.schema, data, blockData.schema)
		result.errors.forEach(function(error) {
			errors.push({
				source: 'yuzu build - validate schema '+ blockData.schema,
				inner: error
			});
		});
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