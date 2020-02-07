var _ = require('lodash');

function AddError(errors, source, message, inner) {

	if(!_.some(errors, function(e) { return e.message == message && e.source == source })) {
		errors.push({
			source: source,
			message: message,
			inner: inner
		})
	}
}

module.exports.AddError = AddError;