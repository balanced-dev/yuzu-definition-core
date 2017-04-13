var _ = require('lodash');
var Validator = require('jsonschema').Validator;

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

function Resolve_ComponentJson(path, data, externalDatas, results)
{
    if(!results) {
		results = {};
		results.valid = true;	
		results.errors = [];
	}
	
	if(_.isArray(data))
		data.forEach(function(item) {
			resolve_CycleProperties(path, item, externalDatas, results);
		})
	else
		resolve_CycleProperties(path, data, externalDatas, results);
	
	return results;
}

function resolve_CycleProperties(path, data, externalDatas, results) {
	Object.keys(data).forEach(function(key) {
		if(_.isPlainObject(data[key]))
		{
			if(_.isArray(data[key])) {
				data[key].forEach(function(id) {
					resolve_Ref(path, data[key][id]['$ref'], data, key, externalDatas, results);
				})
			}
			else {
				resolve_Ref(path, data[key]['$ref'], data, key, externalDatas, results);
			}
		}
		else if(_.isArray(data[key]))
		{
			var count = 0;
			data[key].forEach(function(id) {
				if(id['$ref']) {
					resolve_Ref(path, id['$ref'], data[key], count, externalDatas, results);					
				}
				else {
					resolve_CycleProperties(path, id, externalDatas, results);
				}
				count ++;
			})
		}
	})
}

function resolve_Ref(path, ref, data, key, externalDatas, results)
{
	if(ref) {
		if(!externalDatas[ref]) {
			results.valid = false;
			results.errors.push('Json component reference not found in '+ path  +' : '+ ref);
		}
		else {
			var resolvedData = externalDatas[ref];
			Resolve_ComponentJson(path + ref, resolvedData, externalDatas, results);
			data[key] = resolvedData;					
		}
	}
}

function ValidateSchema(externalSchemas, parseResults, dataObject)
{
    var v = new Validator();	
    if(externalSchemas)  {
        Object.keys(externalSchemas).forEach(function(key) {
            v.addSchema(externalSchemas[key], key);				
        });	
    }			
    
    return v.validate(parseResults.data, dataObject.schema);
}

module.exports.resolveComponentJson = Resolve_ComponentJson;
module.exports.testJSON = TestJSON;
module.exports.validateSchema = ValidateSchema;
