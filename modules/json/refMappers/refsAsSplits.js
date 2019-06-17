var _ = require('lodash');

const process = function(path, ref, key, refMap, childRefMap, config)
{
    var state = removeSlashPrefix(ref);
    var type = getBlockTypeFromState(state);

    if(!refMap[type]) {
        refMap[type] = {};
    }

    if(!refMap[type][state]) {
        refMap[type][state] = {};
        refMap[type][state].paths = []
    }

    refMap[type][state].paths.push(path);
    
    if(!refMap[type][state].data) {
        refMap[type][state].data = config.external[ref]; 
    }

    Object.keys(childRefMap).forEach(function(type) {

        var prop = childRefMap[type];

        if(!refMap[type])
        {
            refMap[type] = {};
        }

        Object.keys(prop).forEach(function(state) {

            if(!refMap[type][state]) {
                refMap[type][state] = {};
                refMap[type][state].paths = []
            }

            refMap[type][state].paths = refMap[type][state].paths.concat(prop[state].paths);

            if(!refMap[type][state].data) {
                refMap[type][state].data = prop[state].data; 
            }

        });

    });

}

const removeSlashPrefix = function(ref) {
    if(ref.startsWith('/'))
        return ref.substr(1);
    else
        return ref;
}

const getBlockTypeFromState = function(ref)
{
    return ref.split('_')[0];
}


module.exports = { process }