var _ = require('lodash');

const isValid = function(property) {
    return property.textType != undefined;
}

const apply = function(results, property, path)
{
    if(!results.output.textType)
        results.output.textType = {};

    results.output.textType[path] = property.textType;    
}

module.exports = { isValid, apply }