
const process = function(path, ref, key, refMap, childRefMap)
{
    var value = {};
    value.ref = ref;
    value.children = childRefMap;

    refMap[key] = value;
}


module.exports = { process }