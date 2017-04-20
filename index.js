var findTemplateAndValidateFromJson = require('./modules/findTemplateAndValidateFromJson');
var findTemplateAndValidateFromLayout = require('./modules/findTemplateAndValidateFromLayout');
var registerHandlebarsPartials = require('./modules/registerHandlebarsPartials');
var getExternals = require('./modules/getExternals');
var gulpSassJson = require('./modules/hifi-gulp-sass-json');

module.exports.findTemplateAndValidateFromJson = findTemplateAndValidateFromJson;
module.exports.findTemplateAndValidateFromLayout = findTemplateAndValidateFromLayout;
module.exports.registerHandlebarsPartials = registerHandlebarsPartials;
module.exports.gulpSassJson = gulpSassJson;