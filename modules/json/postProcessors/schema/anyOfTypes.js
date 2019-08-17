var _ = require('lodash');

const apply = function(results, data, config) {

    if(data.anyOfTypes) {
        var output = {};

        data.anyOfTypes.forEach(anyOfType => {
            
            output[anyOfType] = {};
            output["anyOfTypes"] = data.anyOfTypes;
            config.refMapper.postProcess(output, anyOfType, results.output.refs, config.external);

        });

        results.output = output; 
    }
    return results;

}

module.exports = { apply }