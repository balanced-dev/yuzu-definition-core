var jsonHelper = require('../modules/jsonHelper/jsonHelper');
var templateHelper = require('./templateHelper/templateHelper');
var renderHelper = require('./renderHelper/renderHelper');

var build = function(data, path, externals, layouts, errors) {

	var blockData = getBlockData(path);

	data = parseJson(data, path, errors);
	data = resolveJson(data, externals, blockData, errors);

	validateSchema(data, blockData, errors);

	return renderHelper.fromTemplate(path, blockData.template, data, layouts, errors, blockData.blockLayout);
}

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

const validateSchema = function(data, blockData, errors) {
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
		

module.exports = build;