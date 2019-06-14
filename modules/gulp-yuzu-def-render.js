var gutil = require('gulp-util');
var through = require('through2');
var build = require('./build');

function gulp(templatesDir, hbsHelpers, layoutDir) {

	build.register(templatesDir, hbsHelpers);
	var externals = build.setup(templatesDir, layoutDir);

	return through.obj(function (file, enc, cb) {

		var errors = [];

		if (file.isNull()) {
			this.push(file);
			return cb();
		}
		
		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('yuzu render', 'Streaming not supported'));
			return cb();
		}

		var renderedTemplate = build.render(file.contents.toString(), file.path, externals, errors);

		if(errors.length > 0) {
			errors.forEach(function(error) {
				this.emit('error', new gutil.PluginError(error.source, error.inner));
			});
			return cb();	
		}

		file.contents = new Buffer(renderedTemplate);

		this.push(file);
		cb();
	});
}

module.exports = gulp;