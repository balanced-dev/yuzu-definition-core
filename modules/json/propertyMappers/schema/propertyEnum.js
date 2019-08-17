var _ = require('lodash');

const isValid = function(property) {
    return property.enum;
}

const apply = function(results, property, path)
{
    if(!results.output.enums)
        results.output.enums = {};

    results.output.enums[path] = property.enum;    
}

module.exports = { isValid, apply }