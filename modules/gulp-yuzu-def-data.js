var gutil = require('gulp-util');
var through = require('through2');
var build = require('./build');

function buildData(templatesDir) {

	var externals = build.setup(templatesDir);

	return through.obj(function (file, enc, cb) {

		if (file.isNull()) {
			this.push(file);
			return cb();
		}
		
		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('Build Data validate error', 'Streaming not supported'));
			return cb();
		}

		var data = build.resolveDataString(file.contents.toString(), file.path, externals, errors);

		file.contents = new Buffer(data);

		this.push(file);
		cb();
	});
}

module.exports = buildData;