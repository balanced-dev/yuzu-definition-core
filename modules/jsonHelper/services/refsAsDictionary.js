var _ = require('lodash');

const process = function(path, ref, key, refMap, childRefMap)
{
    if(!refMap[ref]) {
        refMap[ref] = {};
        refMap[ref].paths = [];
    }
    refMap[ref].paths.push(path);

    Object.keys(childRefMap).forEach(function(key) {

        var prop = childRefMap[key];

        if(!refMap[key])
        {
            refMap[key] = {};
            refMap[key].paths = [];
        }

        refMap[key].paths = refMap[key].paths.concat(prop.paths);

    });

}


module.exports = { process }