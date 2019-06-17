var _ = require('lodash');

const process = function(path, ref, key, refMap, childRefMap, config)
{

    if(!refMap[ref]) {
        refMap[ref] = config.external[ref];
    }

    Object.keys(childRefMap).forEach(function(ref) {

        var childRef = childRefMap[ref];

        if(!refMap[ref])
        {
            refMap[ref] = childRef;
        }

    });

}


module.exports = { process }