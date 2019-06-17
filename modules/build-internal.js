var jsonService = require('./json/jsonService');
var refMapperSplits = require('./json/refMappers/refsAsSplits');

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
	var resolveResults = jsonService.resolveComponentJson(data, { external: externals.data });
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

	var results = jsonService.resolveComponentJson(schema, { external: externals.data, refMapper: refMapperSplits, deepclone: true });
	return results.refMap;
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

		var result = jsonService.validateSchema(externals.schema, data, blockData.schema)
		result.errors.forEach(function(error) {
			errors.push({
				source: 'yuzu build - validate schema '+ blockData.schema,
				inner: error
			});
		});
	}
}
		
module.exports = { 
	parseJson,
	resolveJson,
	resolveSchemaAsDictionaryRefMap,
	getBlockData,
	validateSchema
};