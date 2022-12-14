var _ = require('lodash');
var Validator = require('jsonschema').Validator;
var errorSvc = require('../services/errorService');
var errorSource = 'Validate schema and data';

function Resolve_ComponentJsonSchema(data, config)
{
	var results = {};
	results.valid = true;	
	results.errors = [];
	results.output = {};

	var refMap = {};
	
	Resolve_From_Root('', data, refMap, config, results, true);
	
	results.output.refs = refMap;

	if(config.postProcessor) {
		results = config.postProcessor.apply(results, data, config);
	}

	if(config.filePath) {
		results.output.path = config.filePath;
	}

	return results;
}

function Resolve_From_Root(path, data, refMap, config, results, isRoot)
{
	if(data) {
		if(data.type === "array") {
			var items = data.items;
	
			if(items) {
				if(items.hasOwnProperty('$ref')) {
					resolve_Ref(items, path, "", items, refMap, config, results);
				}
				else if(items.hasOwnProperty("anyOf")) {
					if(config.removeAnyOf) {
						items.anyOf = [];
					}
					else { 
						doMultipleRefs(path, items.anyOf, refMap, config, results);	
					}
				}
				else {
					resolve_CycleProperties(path, items.properties, refMap, config, results, isRoot);
				}
			}
			
		}
		else if (data.hasOwnProperty("anyOf")) {
			if(config.removeAnyOf) {
				data.anyOf = [];
			}
			else {
				doMultipleRefs(path, data.anyOf, refMap, config, results);
			}
		}
		else if (data.type === "object") {
			resolve_CycleProperties(path, data.properties, refMap, config, results, isRoot);
		}
	}
	
	return results;
}

doMultipleRefs = function(path, items, refMap, config, results) {

	if(items) {
		items.forEach(function(item) {
			if(item['$ref']) {
				resolve_Ref(item, path, "", items, refMap, config, results);
			}
		})
	}
}

function resolve_CycleProperties(path, object, refMap, config, results, isRoot) {
	if(object) {
		Object.keys(object).forEach(function(key) {
			var property = object[key];
			var propertyMapper = _.find(config.propertyMappers, (i) => { return i.isValid(property); });

			if(property['$ref']) {
				resolve_Ref(property, path, key, object, refMap, config, results);
			}
			else if(propertyMapper && isRoot) {
				var newPath = path +'/'+ key;
				propertyMapper.apply(results, property, newPath);
			}
			else {
				var newPath = path +'/'+ key;
				Resolve_From_Root(newPath, property, refMap, config, results, isRoot);
			}
		})
	}
}

function resolve_Ref(refProperty, path, key, context, refMap, config, results)
{
	var ref = refProperty['$ref'];
	if(ref) {

		if(key) {
			path = path +'/'+ key;
		}

		if(!config.external.hasOwnProperty(ref)) {
			results.valid = false;
			results.errors.push('Json schema component reference not found in '+ path +' for schema '+ ref);
		}
		else {

            var childData =  _.cloneDeep(config.external[ref]);
            var childRefMap = {};
            Resolve_From_Root(path, childData, childRefMap, config, results, false);

            if(config.refMapper)
                config.refMapper.process(path, refProperty, key, refMap, childRefMap, config);
            			
		}
	}
}

function ValidateSchema(externalSchemas, data, schema, errors)
{

	if(!schema) {
		errorSvc.AddError(errors, errorSource, 'schema not found');		
	}
	else {
		try{

			var v = new Validator();	
			if(externalSchemas)  {
				Object.keys(externalSchemas).forEach(function(key) {
					v.addSchema(externalSchemas[key], key);				
				});	
			}			

			var result = v.validate(data, schema);
			result.errors.forEach(function(error) {
				var message = '';
				if(error.instance && _.isString(error.instance)) message = message + 'Data value : '+ error.instance +'\n';
				if(error.property && error.property != 'instance') message = message + 'Schema property : '+ error.property +'\n';
				if(error.message) message = message + error.message;
				
				errorSvc.AddError(errors, errorSource, message, error);	
			});

		}
		catch (error){
			errorSvc.AddError(errors, errorSource, "schema validation error: "+ error.message, error);
		}
	}

}

module.exports.Resolve_ComponentJsonSchema = Resolve_ComponentJsonSchema;
module.exports.validateSchema = ValidateSchema;
