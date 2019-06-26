
const process = function(path, ref, key, refMap, childRefMap)
{
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


module.exports = { process }