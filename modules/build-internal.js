var jsonService = require('./json/jsonService');
var jsonSchemaService = require('./json/jsonSchemaService');
var refMapperList = require('./json/refMappers/json/refsAsList');
var refMapperObject = require('./json/refMappers/json/refsAsObject');
var refMapperPaths = require('./json/refMappers/schema/refsAsTree');

var blockFilesService = require('./services/blockFilesService');

/*private*/
const parseJson = function(fileContents, path, errors)
{
	var results = jsonService.testJSON(fileContents);
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
	var resolveResults = jsonService.resolveComponentJson(data, { external: externals.data, addRefProperty: true, addPathProperty: true, deepclone: true });
	if(!resolveResults.valid) {
		resolveResults.errors.forEach(function(error) {
			errors.push({
				source: 'yuzu build - json resolve for '+ blockData.schema.id,
				inner: error
			});
		});
	}
	return data;
}

const resolveDataAsObjectRefMap = function(data, externals) {

	var results = jsonService.resolveComponentJson(data, { external: externals.data, refMapper: refMapperObject, deepclone: true });
	return results.refMap;
}

const resolveDataAsListRefMap = function(data, externals) {

	var results = jsonService.resolveComponentJson(data, { external: externals.data, refMapper: refMapperList, deepclone: true });
	return results.refMap;
}

const resolveSchemaAsPathsRefMap = function(schema, externals) {

	var results = jsonSchemaService.Resolve_ComponentJsonSchema(schema, { external: externals.schema, refMapper: refMapperPaths });
	return results.refMap;
}

const resolveSchemaRemoveAnyOf = function(schema, externals) {

	jsonSchemaService.Resolve_ComponentJsonSchema(schema, { external: externals.schema, removeAnyOf: true });
	return schema;
}

const getBlockData = function(path) {

	var blockData = blockFilesService.Get(path);
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

		var result = jsonSchemaService.validateSchema(externals.schema, data, blockData.schema)
		result.errors.forEach(function(error) {
			errors.push({
				source: 'yuzu build ('+ blockData.schema.id +') - validate schema '+ error.schema +', '+ error.property,
				inner: error
			});
		});
	}
}
		
module.exports = { 
	parseJson,
	resolveJson,
	resolveDataAsListRefMap,
	resolveDataAsObjectRefMap,
	resolveSchemaAsPathsRefMap,
	resolveSchemaRemoveAnyOf,
	getBlockData,
	validateSchema
};