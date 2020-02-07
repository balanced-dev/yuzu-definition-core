var _ = require('lodash');
var Validator = require('jsonschema').Validator;
var blockPathService = require('../services/blockPathService');
var empty = require('../json-schema-empty/index').default;
var errorSvc = require('../services/errorService');
var errorSourceParse = 'Parse JSON file';
var errorSourceResolve = 'Resolve JSON file'

function TestJSON(json, errors){
    var output = {};
	try{
        output = JSON.parse(json);
		if(!_.isPlainObject(output) && !_.isArray(output)) {
			errorSvc.AddError(errors, errorSourceParse, 'Json data must be an plain object or array');
		}
    }
    catch (error){
		errorSvc.AddError(errors, errorSourceResolve, error.message, error);
    }
	return output;
}

function Resolve_ComponentJson(data, errors, config)
{
	var results = {};
	results.valid = true;	

	var refMap = {};
	if(config.refMapper && config.refMapper.init) {
		config.refMapper.init(refMap);
	}
	
	Resolve_From_Root('', data, refMap, config, results, errors);

	results.refMap = refMap;

	if(errors.length > 0)
		results.valid = false;
	
	return results;
}

function Resolve_From_Root(path, data, refMap, config, results, errors)
{
	if(_.isArray(data)) {
		var index = 0;
		data.forEach(function(item) {
			if(item.hasOwnProperty('$ref')) {
				var ref = item['$ref'];
				resolve_Ref(ref, path, "", data, refMap, config, results, errors, index);
			}
			else {
				resolve_CycleProperties(path, item, refMap, config, results, errors);
			}
			index ++;
		})
	}
	else
		resolve_CycleProperties(path, data, refMap, config, results, errors);
	
	return results;
}

function resolve_CycleProperties(path, object, refMap, config, results, errors) {
	Object.keys(object).forEach(function(key) {
		var property = object[key];
		if(_.isPlainObject(property))
		{
			if(property['$ref']) { // externalize on this using this conditional as a is valid and the resolve as the apply
				var ref = property['$ref'];
				resolve_Ref(ref, path, key, object, refMap, config, results, errors);
			}
			else {
				var newPath = createNewObjectPath(path, key, object);
				resolve_CycleProperties(newPath, property, refMap, config, results, errors);
			}
		}
		else if(_.isArray(property))
		{
			var index = 0;
			property.forEach(function(item) {
				if(item['$ref']) {
					var ref = item['$ref'];
					resolve_Ref(ref, path, key, property, refMap, config, results, errors, index);		
				}
				else {
					var newPath = createNewObjectPath(path, key, item, index);
					resolve_CycleProperties(newPath, item, refMap, config, results, errors);
				}
				index ++;
			})
		}
	})
}

const createNewObjectPath = function(path, key, object, index) {

	var newPath = path +'/'+ key;
	if(index != undefined) {
		newPath = newPath +'['+ index +']'
	}
	return newPath;
}

function resolve_Ref(ref, path, key, context, refMap, config, results, errors, index)
{
	if(ref) {

		var newPath = createNewObjectPath(path, key, context, index);

		if(!config.external.hasOwnProperty(ref)) {
			errorSvc.AddError(errors, errorSourceResolve, 'Json data component reference not found in '+ newPath +' for data ref : '+ ref +'. Is this inline data?');
		}
		else {

            var childData =  config.deepclone ? _.cloneDeep(config.external[ref]) : config.external[ref];
            var childRefMap = {};
            Resolve_From_Root(newPath, childData, childRefMap, config, results, errors);
			
			if(config.addRefProperty)
				childData["_ref"] = blockPathService.blockFromState(ref, false);

			if(config.addPathProperty)
				childData["yuzu-path"] = newPath;

			if(index != undefined) {
				context[index] = childData;	
			}
			else {
				context[key] = childData;	
			}


            if(config.refMapper)
                config.refMapper.process(newPath, ref, key, refMap, childRefMap, config);
            			
		}
	}
}

function getEmpty(ref, externals, path)
{
	var schema = externals.schema[ref];

	if(path) {
		
		var paths = path.split("/"); 
		paths.forEach(partPath => {
			if(schema.properties.hasOwnProperty(partPath)) {
				var property = schema.properties[partPath];
				if(property.type == "object") {
					schema = property;
				}
				else if(property.type == "array") {
					schema = emptyForArray(property, externals);
				}
				else {
					throw "Property "+ partPath +" at path "+ path +" wrong type";
				}
			}
			else {
				throw "Property "+ partPath +" not found";
			}
		});
	}
	else if(schema.type == 'array' && schema.items.type == 'object') {
		schema = schema.items;
	}
	else if(schema.type == 'array' && schema.items.$ref) {
		schema = externals.schema[schema.items.$ref];
	}

	return empty(schema, externals);
}

function emptyForArray(property, externals)
{
	var items = property.items;
	if(items.hasOwnProperty("$ref")) {
		var subRef = items["$ref"];
		schema = externals.schema[subRef]
	}
	else {
		schema = items;
		if(!schema.type){
			schema.type = 'object';
		}
	}
	return schema;
}

module.exports.resolveComponentJson = Resolve_ComponentJson;
module.exports.testJSON = TestJSON;
module.exports.getEmpty = getEmpty;
