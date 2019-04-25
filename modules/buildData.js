var gutil = require('gulp-util');
var through = require('through2');
var extend = require('util-extend');
var jsonHelper = require('../modules/jsonHelper');

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

		var resolveResults = jsonHelper.resolveComponentJson(file.path, parseResults.data, externalDatas);
		if(!resolveResults.valid) {
			this.emit('error', new gutil.PluginError('Build Data validate error', resolveResults.errors[0]));
			return cb();
		}

		parseResults.data.json = JSON.stringify(parseResults.data, null, 4);
		file.contents = new Buffer(parseResults.data.json);

		this.push(file);
		cb();
	});
}

module.exports = buildData;