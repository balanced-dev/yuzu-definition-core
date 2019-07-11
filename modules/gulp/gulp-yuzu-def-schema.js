var gutil = require('gulp-util');
var through = require('through2');
var build = require('../build');

function buildData(templatesDir, addRef) {

	var externals = build.setup(templatesDir);

	return through.obj(function (file, enc, cb) {

		var errors = [];

		if (file.isNull()) {
			this.push(file);
			return cb();
		}
		
		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('yuzu data build', 'Streaming not supported'));
			return cb();
		}

		var schema = build.resolveSchema(file.contents.toString(), externals);
		if(addRef && schema.properties && schema.type == "object") {
			schema.properties['_ref'] = { "type": "string" };
		}


		if(errors.length > 0) {
			var that = this;
			errors.forEach(function(error) {
				that.emit('error', new gutil.PluginError(error.source, error.inner));
			});
			return cb();	
		}

		file.contents = new Buffer(JSON.stringify(schema, null, 4));

		this.push(file);
		cb();
	});
}

module.exports = buildData;