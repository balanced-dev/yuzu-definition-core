var should = require('should'),
	S = require('string'),
	base = require('./base.js');


describe('gulp', function () {

	beforeEach(base.beforeEachFn);

	describe('errors', function () {

		it('should error where file is a stream', function () {

			base.file.isStream = function () { return true; }

			var emit = function (name, error) {
				name.should.equal('error');
				error.message.should.equal('Streaming not supported');
				error.plugin.should.equal('yuzu render');
			}

			base.createBuildMock();
			base.createThroughMock(emit);

			base.svc();
		})

	});

});