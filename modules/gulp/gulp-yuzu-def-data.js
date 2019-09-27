var pluginError = require('plugin-error');
var through = require('through2');
var build = require('../build');

function buildData(templatesDir) {

	var externals = build.setup(templatesDir);

	return through.obj(function (file, enc, cb) {

		var errors = [];

		if (file.isNull()) {
			this.push(file);
			return cb();
		}
		
		if (file.isStream()) {
			this.emit('error', new pluginError('yuzu data build', 'Streaming not supported'));
			return cb();
		}

		var data = build.resolveDataString(file.contents.toString(), file.path, externals, errors);

		if(errors.length > 0) {
			var that = this;
			errors.forEach(function(error) {
				that.emit('error', new pluginError(error.source, error.inner));
			});
			return cb();	
		}

		file.contents = new Buffer(JSON.stringify(data, null, 4));

		this.push(file);
		cb();
	});
}

module.exports = buildData;