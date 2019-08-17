var _ = require('lodash');

const isValid = function(property) {
    return property.type == 'integer' || property.type == 'number';
}

const apply = function(results, property, path)
{
    if(!results.output.numbers)
        results.output.numbers = {};

    results.output.numbers[path] = {
        type: property.type
    };    
}

module.exports = { isValid, apply }