var _ = require('lodash');
var Validator = require('jsonschema').Validator;
var empty = require('../json-schema-empty/index').default;

function TestJSON(json){
    var results = {};
	results.valid = true;
	try{
        results.data = JSON.parse(json);
		if(!_.isPlainObject(results.data) && !_.isArray(results.data)) {
			results.valid = false;
		}
    }
    catch (error){
        results.valid = false;
		results.error = error;
    }
	return results;
}

function Resolve_ComponentJson(data, config)
{
	var results = {};
	results.valid = true;	
    results.errors = [];

	var refMap = {};
	
	Resolve_From_Root('', data, refMap, config, results);

	results.refMap = refMap;
	
	return results;
}

function Resolve_From_Root(path, data, refMap, config, results)
{
	if(_.isArray(data)) {
		var index = 0;
		data.forEach(function(item) {
			if(item.hasOwnProperty('$ref')) {
				var ref = item['$ref'];
				resolve_Ref(ref, path, "", data, refMap, config, results, index);
			}
			else {
				resolve_CycleProperties(path, item, refMap, config, results);
			}
			index ++;
		})
	}
	else
		resolve_CycleProperties(path, data, refMap, config, results);
	
	return results;
}

function resolve_CycleProperties(path, object, refMap, config, results) {
	Object.keys(object).forEach(function(key) {
		var property = object[key];
		if(_.isPlainObject(property))
		{
			if(property['$ref']) { // externalise on this using this conditional as a isvalid and the resolve as the apply
				var ref = property['$ref'];
				resolve_Ref(ref, path, key, object, refMap, config, results);
			}
			else {
				var newPath = key != "properties" ? path +'/'+ key : path;
				resolve_CycleProperties(newPath, property, refMap, config, results);
			}
		}
		else if(_.isArray(property))
		{
			var index = 0;
			property.forEach(function(item) {
				if(item['$ref']) {
					var ref = item['$ref'];
					resolve_Ref(ref, path, key, property, refMap, config, results, index);		
				}
				else {
					var newPath = path +'/'+ key +'['+ index +']';
					resolve_CycleProperties(newPath, item, refMap, config, results);
				}
				index ++;
			})
		}
	})
}

function resolve_Ref(ref, path, key, context, refMap, config, results, index)
{
	if(ref) {

		var newPath = path +'/'+ key;
		if(index != undefined) 
			newPath = newPath +'['+ index +']';

		if(!config.external.hasOwnProperty(ref)) {
			results.valid = false;
			results.errors.push('Json component reference not found in '+ newPath +' for schema '+ ref);
		}
		else {

            var childData =  config.deepclone ? _.cloneDeep(config.external[ref]) : config.external[ref];
            var childRefMap = {};
            Resolve_From_Root(newPath, childData, childRefMap, config, results);
			
			if(config.addRefProperty)
				childData["$ref"] = ref;

			if(config.addPathProperty)
				childData["yuzu-path"] = newPath;

			if(index != undefined)
				context[index] = childData;	
			else
				context[key] = childData;	

            if(config.refMapper)
                config.refMapper.process(newPath, ref, key, refMap, childRefMap, config);
            			
		}
	}
}

function ValidateSchema(externalSchemas, data, schema)
{
    var v = new Validator();	
    if(externalSchemas)  {
        Object.keys(externalSchemas).forEach(function(key) {
            v.addSchema(externalSchemas[key], key);				
        });	
    }			
    
    return v.validate(data, schema);
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

	return empty(schema);
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
	}
	return schema;
}

module.exports.resolveComponentJson = Resolve_ComponentJson;
module.exports.testJSON = TestJSON;
module.exports.validateSchema = ValidateSchema;
module.exports.getEmpty = getEmpty;