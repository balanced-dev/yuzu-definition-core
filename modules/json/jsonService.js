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
	if(_.isArray(data))
		data.forEach(function(item) {
			resolve_CycleProperties(path, item, refMap, config, results);
		})
	else
		resolve_CycleProperties(path, data, refMap, config, results);
	
	return results;
}

function resolve_CycleProperties(path, data, refMap, config, results) {
	Object.keys(data).forEach(function(key) {
		if(_.isPlainObject(data[key]))
		{
			if(_.isArray(data[key])) {
				data[key].forEach(function(id) {
                    var ref = data[key][id]['$ref'];
					resolve_Ref(path, ref, data, refMap, key, config, results);
				})
			}
			else {
				if(data[key]['$ref']) {
                    var ref = data[key]['$ref'];
					resolve_Ref(path, ref, data, refMap, key, config, results);
				}
				else {
					var propertyValue = data[key];
					var newPath = key != "properties" ? path +'/'+ key : path;
					resolve_CycleProperties(newPath, propertyValue, refMap, config, results);
				}
			}
		}
		else if(_.isArray(data[key]))
		{
			var index = 0;
			data[key].forEach(function(id) {
				if(id['$ref']) {
					var ref = id['$ref'];
					var propertyValue = data[key];
					resolve_Ref(path, ref,  propertyValue, refMap, key, config, results, index);		
				}
				else {
					var propertyData = id;
					var newPath = path +'/'+ key +'['+ index +']';
					resolve_CycleProperties(newPath, propertyData, refMap, config, results);
				}
				index ++;
			})
		}
	})
}

function resolve_Ref(path, ref, data, refMap, key, config, results, index)
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
			
			if(index != undefined)
				data[index] = childData;	
			else
           		data[key] = childData;	

            if(config.refMapper)
                config.refMapper.process(newPath, ref, key, refMap, childRefMap);
            			
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

module.exports.resolveComponentJson = Resolve_ComponentJson;
module.exports.testJSON = TestJSON;
module.exports.validateSchema = ValidateSchema;
