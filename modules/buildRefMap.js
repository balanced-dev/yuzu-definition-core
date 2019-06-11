var gutil = require('gulp-util');
var through = require('through2');
var jsonHelper = require('../modules/jsonHelper/jsonHelper');
var refMapper = require('../modules/jsonHelper/services/refsAsDictionary');
var templateHelper = require('./templateHelper/templateHelper');

function buildData(templatesDir) {

	externals = getExternals(templatesDir);

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

		var dataObject = templateHelper.GetTemplateSettings(file);

		var resolveResults = jsonHelper.resolveComponentJson(dataObject.schema, { external: externals.schema, refMapper: refMapper, deepclone: true });
		if(!resolveResults.valid) {
			var that = this;
			resolveResults.errors.forEach(function(error) {
				that.emit('error', new gutil.PluginError('Resolve Map Ref for '+ dataObject.schema.id, error));
			});
			return cb();
		}

		parseResults.data.map = JSON.stringify(resolveResults.refMap, null, 4);
		file.contents = new Buffer(parseResults.data.map);

		this.push(file);
		cb();
	});
}

module.exports = buildData;