var gutil = require('gulp-util');
var through = require('through2');
var jsonHelper = require('../modules/jsonHelper/jsonHelper');
var templateHelper = require('./templateHelper/templateHelper');
var renderHelper = require('./renderHelper/renderHelper');
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

		file.validated = false;

		var parseResults = jsonHelper.testJSON(file.contents.toString())
		if(!parseResults.valid) {
			this.emit('error', new gutil.PluginError('Find template and validate error', 'JSON Error for '+ file.path +', '+ parseResults.error));
			return cb();
		}
		
		var resolveResults = jsonHelper.resolveComponentJson(parseResults.data, { external: externals.data });
		if(!resolveResults.valid) {
			this.emit('error', new gutil.PluginError('Find template and validate error', resolveResults.errors[0]));
			return cb();
		}

		var dataObject = templateHelper.GetTemplateSettings(file);
		if(dataObject.error) {
			this.emit('error', new gutil.PluginError('Find template and validate error', dataObject.error));
			return cb();
		}

		if(!dataObject.schema) {
			this.emit('error', new gutil.PluginError('Find template and validate error', 'Schema file not found in the parent directory for '+ dataObject.path));
			return cb();			
		}
		else{

			var result = jsonHelper.validateSchema(externals.schema, parseResults, dataObject)
			if(result.errors.length > 0) {
				this.emit('error', new gutil.PluginError('Find template and validate error', 'validation on '+ dataObject.path +' : '+ result.errors[0].message +' for '+ result.errors[0].schema));
				return cb();	
			}
			else
				file.validated = true;
		}

		var renderedTemplate = renderHelper.fromTemplate(file.path, dataObject.template, parseResults.data, layouts, errors, dataObject.blockLayout);

		if(file.errors) {
			this.emit('error', new gutil.PluginError("render error", 'Schema file not found in the parent directory for '+ dataObject.path));
			return cb();	
		}

		file.contents = new Buffer(renderedTemplate);

		this.push(file);
		cb();
	});
}

module.exports = findTemplateAndValidate;