var _ = require('lodash');

const process = function(path, ref, key, refMap, childRefMap, config)
{
    if(!refMap.hasOwnProperty('items')) {
        refMap.items = [];
    }

    if(!_.find(refMap.items, { name: ref })) {
        refMap.items.push({
            name: ref,
            state: config.external[ref]
        });
    }

    if(childRefMap.items) {
        childRefMap.items.forEach(function(item) {
            if(!_.find(refMap.items, { name: item.name }))
            {
                refMap.items.push(item);
            }
        })
    }

}


module.exports = { process }