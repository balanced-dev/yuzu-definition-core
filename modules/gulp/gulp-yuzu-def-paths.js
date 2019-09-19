var pluginError = require('plugin-error');
var through = require('through2');
var build = require('../build');

function buildPaths(templatesDir) {

	var externals = build.setup(templatesDir);

	return through.obj(function (file, enc, cb) {

		if (file.isNull()) {
			this.push(file);
			return cb();
		}
		
		if (file.isStream()) {
			this.emit('error', new pluginError('yuzu data build', 'Streaming not supported'));
			return cb();
		}

		var data = build.resolvePaths(file.contents.toString(), externals);

		file.contents = new Buffer(JSON.stringify(data, null, 4));

		this.push(file);
		cb();
	});
}

module.exports = buildPaths;