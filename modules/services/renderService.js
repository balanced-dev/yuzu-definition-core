var handlebars = require('handlebars');
var extend = require('extend');
var layoutHelper = require('./layoutService');

const render = (hbs, data, errors) => {
    var output = '';

    try {
        var template = handlebars.compile(hbs);
        output = template(data);
    } 
    catch (err) {
        errors.push({
            source: "Handlebars render",
            inner: err
        })
    }
    
    return output;
}

const wrapSingle = (hbs, data, contents, errors) => {
    
    var newData = extend(data, {contents: contents});
    return render(hbs, newData, errors);

}

const wrapMultiple = function(hbses, datas, errors) {

    var prevTemplate;
    for(var index in hbses) {
        var hbs = hbses[index];
        var data = datas[index];

        if(prevTemplate) {
            prevTemplate = wrapSingle(hbs, data, prevTemplate, errors);
        }
        else {
            prevTemplate = render(hbs, data, errors);
        }
    }

    return prevTemplate
}

const fromTemplate = function(path, template, data, layouts, errors, blockLayout) {

    //build hbs wrapping
    var templates = [
        template
    ];
    var datas = [
        data
    ]

    //add master layout
    if(blockLayout) {
        var layout = layoutHelper.GetBlockLayout(blockLayout);
        if(layout) {
            templates.push(layout.template);
            datas.push(layout.data);
        }
    }

    //add master layout
    var layout = layoutHelper.GetLayout(path, layouts);
    if(layout) {
        templates.push(layout.template);
        datas.push(layout.data);
    }

    return wrapMultiple(templates, datas, errors);

}

module.exports.fromTemplate = fromTemplate;
module.exports.wrapMultiple = wrapMultiple;
module.exports.wrapSingle = wrapSingle;
module.exports.render = render;
module.exports.handlebars = handlebars;
