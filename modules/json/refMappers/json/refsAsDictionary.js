var _ = require('lodash');

const process = function(path, state, key, refMap, childRefMap)
{
    state = removeSlashPrefix(state);
    var ref = getBlockTypeFromState(state);

    if(!refMap[ref]) {
        refMap[ref] = {};
        refMap[ref].instances = [];
    }
    refMap[ref].instances.push({
        path: path,
        state: state
    });

    Object.keys(childRefMap).forEach(function(key) {

        var prop = childRefMap[key];

        if(!refMap[key])
        {
            refMap[key] = {};
            refMap[key].instances = [];
        }

        refMap[key].instances = refMap[key].instances.concat(prop.instances);

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