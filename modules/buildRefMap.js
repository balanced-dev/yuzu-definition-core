var gutil = require('gulp-util');
var through = require('through2');
var extend = require('util-extend');
var jsonHelper = require('../modules/jsonHelper');
var refMapper = require('../modules/jsonHelper/services/refsAsDictionary');

function buildData(externalSchemas, externalDatas) {

	return through.obj(function (file, enc, cb) {

		if (file.isNull()) {
			this.push(file);
			return cb();
		}
		
		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('Build Data validate error', 'Streaming not supported'));
			return cb();
		}

		var parseResults = jsonHelper.testJSON(file.contents.toString())
		if(!parseResults.valid) {
			this.emit('error', new gutil.PluginError('Build Data validate error', 'JSON Error for '+ file.path +', '+ parseResults.error));
			return cb();
		}

		var resolveResults = jsonHelper.resolveComponentJson(parseResults.data, { externals: externalDatas, refMapper = refMapper, deepclone = true });
		if(!resolveResults.valid) {
			this.emit('error', new gutil.PluginError('Build Data validate error', resolveResults.errors[0]));
			return cb();
		}

		file.contents = new Buffer(resolveResults.refMap);

		this.push(file);
		cb();
	});
}

module.exports = buildData;