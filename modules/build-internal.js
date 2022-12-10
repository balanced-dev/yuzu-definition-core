var path = require('path');
var jsonService = require('./json/jsonService');
var jsonSchemaService = require('./json/jsonSchemaService');
var refMapperList = require('./json/refMappers/json/refsAsList');
var refMapperObject = require('./json/refMappers/json/refsAsObject');

var propertyMappers = [];
propertyMappers.push(require('./json/propertyMappers/schema/propertyEnum'));
propertyMappers.push(require('./json/propertyMappers/schema/propertyTextType'));
propertyMappers.push(require('./json/propertyMappers/schema/propertyNumeric'));
var refMapperPaths = require('./json/refMappers/schema/refsAsTree');
var postProcessor = require('./json/postProcessors/schema/anyOfTypes');

var blockFilesService = require('./services/blockFilesService');

/*private*/
const parseJson = function(fileContents, errors)
{
	return jsonService.testJSON(fileContents, errors);
}

const resolveJson = function(data, externals, blockData, errors)
{
	jsonService.resolveComponentJson(data, errors, { external: externals.data, addRefProperty: true, addPathProperty: true, deepclone: true });
	return data;
}

const resolveDataAsObjectRefMap = function(data, externals) {

	var results = jsonService.resolveComponentJson(data, [], { external: externals.data, refMapper: refMapperObject, deepclone: true });
	return results.refMap;
}

const resolveDataAsListRefMap = function(data, externals) {

	var results = jsonService.resolveComponentJson(data, [], { external: externals.data, refMapper: refMapperList, deepclone: true });
	return results.refMap;
}

const resolveSchemaAsPathsRefMap = function(schema, externals) {

	var results = jsonSchemaService.Resolve_ComponentJsonSchema(schema, { 
		external: externals.schema,
		postProcessor: postProcessor,
		refMapper: refMapperPaths, 
		propertyMappers: propertyMappers
	});
	return results.output;
}

const resolveSchemaRemoveAnyOf = function(schema, externals) {

	jsonSchemaService.Resolve_ComponentJsonSchema(schema, { external: externals.schema, removeAnyOf: true });
	return schema;
}

const getBlockFiles = function(path) {

	var blockData = blockFilesService.GetFiles(path);

	return blockData;
}

const getBlockData = function(path, errors) {

	var blockData = blockFilesService.Get(path, errors);

	return blockData;
}

const validateSchema = function(data, externals, blockData, errors) {
	jsonSchemaService.validateSchema(externals.schema, data, blockData.schema, errors)
}
		
module.exports = { 
	parseJson,
	resolveJson,
	resolveDataAsListRefMap,
	resolveDataAsObjectRefMap,
	resolveSchemaAsPathsRefMap,
	resolveSchemaRemoveAnyOf,
	getBlockData,
	getBlockFiles,
	validateSchema
};