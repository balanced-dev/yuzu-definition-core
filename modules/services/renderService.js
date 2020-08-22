var extend = require('extend');
var layoutHelper = require('./layoutService');
var errorSvc = require('./errorService');
var errorSource = 'Template rendering';

const render = (hbs, data, errors) => {
    var output = '';

    try {
        var template = handlebars.compile(hbs);
        output = template(data);
    } 
    catch (err) {
		errorSvc.AddError(errors, errorSource, err.message, err);
    }
    
    return output;
}

const wrapSingle = (hbs, data, contents, errors) => {
    
    var content = {contents: contents};
    var newData = extend(data, content);
    return render(hbs, newData, errors);
}

const wrapMultiple = function(allBlockData, errors) {

    var prevTemplate;
    for(var blockData of allBlockData) {

        if(blockData.template) {
            if(prevTemplate) {
                prevTemplate = wrapSingle(blockData.template, blockData.data, prevTemplate, errors);
            }
            else {
                prevTemplate = render(blockData.template, blockData.data, errors);
            }
        }
        else {
            prevTemplate = blockData.markup;
            if(blockData.data._endpoint) {
                prevTemplate = prevTemplate.replace(/<\w*\s/, '$&data-endpoint=\''+ blockData.data._endpoint +'\' ');
            }
        }
    }

    return prevTemplate
}

const fromTemplate = function(path, blockData, data, layouts, errors) {

    blockData.data = data;
    var allBlockData = [
        blockData
    ];

    //add selected layout
    var layout = layoutHelper.GetLayout(path, layouts, data);
    if(layout) {
        allBlockData.push(layout);
    }

    return wrapMultiple(allBlockData, errors);

}

module.exports.fromTemplate = fromTemplate;
module.exports.wrapMultiple = wrapMultiple;
module.exports.wrapSingle = wrapSingle;
module.exports.render = render;
