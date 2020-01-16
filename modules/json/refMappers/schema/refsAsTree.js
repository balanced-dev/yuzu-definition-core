var _ = require('lodash');

const postProcess = function(output, anyOfType, refMap, external) {

    output[anyOfType].refs = {};

    Object.keys(refMap).forEach(key => {
           
        var val = _.chain(refMap[key]).find((item) => { 
            return item.startsWith("/"+ anyOfType); 
        }).value();
        var schema = external[val];
    
        if(schema != undefined && schema.type == "array" && schema.items && schema.items.anyOf) {
            output[anyOfType].refs[key] = _.map(schema.items.anyOf, (i) => { 
                return i["$ref"]; 
            });
        }
        else if(schema != undefined) {
            output[anyOfType].refs[key] = [val]; 
        }
        else {
            output[anyOfType].refs[key] = refMap[key];
        }

    });

}

const process = function(path, refProperty, key, refMap, childRefMap)
{
    var ref = refProperty['$ref'];
    if(refProperty.hasOwnProperty('anyOfType'))
        ref = ref +'^'+ refProperty['anyOfType'];

    if(refMap.hasOwnProperty(path)) {
        refMap[path].push(ref);
    }
    else {
        refMap[path] = [ref];
    }
}

module.exports = { process, postProcess }