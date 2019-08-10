var _ = require('lodash');

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

    /*Object.keys(childRefMap).forEach(function(path) {

        var childRef = childRefMap[path];

        if(refMap.hasOwnProperty(path)) {
            refMap[path] = refMap[path].concat(childRef);
        }
        else {
            refMap[path] = childRef;
        }

    });*/

}

const postProcess = function(refMap, external) {

    if(refMap.anyOfTypes) {
        var output = {};

        refMap.anyOfTypes.forEach(anyOfType => {
            
            output[anyOfType] = {};
            output["anyOfTypes"] = refMap.anyOfTypes;
            Object.keys(refMap).forEach(key => {
                if(key != "anyOfTypes") {
                    var val = _.chain(refMap[key]).find((item) => { 
                        return item.startsWith("/"+ anyOfType); 
                    }).value();
                    var schema = external[val];

                    if(schema.type == "array" && schema.items && schema.items.anyOf) {
                        output[anyOfType][key] = _.map(schema.items.anyOf, (i) => { 
                            return i["$ref"]; 
                        });
                    }
                    else {
                        output[anyOfType][key] = [val]; 
                    }
                }
            });

        });

        return output;
    }
    else
        return refMap;

}

module.exports = { process, postProcess }