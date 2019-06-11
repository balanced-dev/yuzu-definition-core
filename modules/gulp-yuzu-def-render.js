var gutil = require('gulp-util');
var through = require('through2');
var build = require('./build');
var templateHelper = require('./templateHelper/templateHelper');

var registerHandlebarsPartials = require('./registerHandlebarsPartials');
var getExternals = require('./getExternals');

function findTemplateAndValidate(templatesDir, layoutDir, helpers) {

	registerHandlebarsPartials.register.partials(templatesDir);
	registerHandlebarsPartials.register.helpers(helpers);
	externals = getExternals(templatesDir);
	layouts = templateHelper.GetLayouts(layoutDir);

	return through.obj(function (file, enc, cb) {

		var errors = [];

		if (file.isNull()) {
			this.push(file);
			return cb();
		}
		
		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('Find template and validate error', 'Streaming not supported'));
			return cb();
		}

		var renderedTemplate = build(file.contents.toString(), file.path, externals, layouts, errors);

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

module.exports = findTemplateAndValidate;