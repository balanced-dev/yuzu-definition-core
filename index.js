handlebars = require('handlebars');
fs = require("fs");

var gulpBuild = require('./modules/gulp/gulp-yuzu-def-render');
var gulpData = require('./modules/gulp/gulp-yuzu-def-data');
var gulpPaths = require('./modules/gulp/gulp-yuzu-def-paths');
var gulpSchema = require('./modules/gulp/gulp-yuzu-def-schema');
var build = require('./modules/build');
var middleware = require('./modules/browser-sync/yuzumiddleware');

module.exports.gulpBuild = gulpBuild;
module.exports.gulpData = gulpData;
module.exports.gulpPaths = gulpPaths;
module.exports.gulpSchema = gulpSchema;
module.exports.build = build;
module.exports.middleware = middleware;