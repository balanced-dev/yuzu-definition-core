handlebars = require('handlebars');

var gulpBuild = require('./modules/gulp/gulp-yuzu-def-render');
var gulpData = require('./modules/gulp/gulp-yuzu-def-data');
var build = require('./modules/build');
var middleware = require('./modules/browser-sync/yuzumiddleware');

module.exports.gulpBuild = gulpBuild;
module.exports.gulpData = gulpData;
module.exports.build = build;
module.exports.middleware = middleware;