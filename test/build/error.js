var should = require('should'),
S = require('string'),
base = require('./base.js');


describe('build error', function() {
	
	beforeEach(base.beforeEachFn);
	
	it('should error where file is a stream', function() {
	
		base.file.isStream = function() { return true; }

		var emit = function(name, error) {
			name.should.equal('error');
			error.message.should.equal('Streaming not supported');
			error.plugin.should.equal('Find template and validate error');
		}
		
		base.createThroughMock(emit);		
		
		base.svc();
	})		
	
	it('should error when the content file does not parse as json', function() {

		base.file.contents = new Buffer('{name: "test"}');
		base.file.path = 'c:/templates/parHeader/data/template_data.json';
	
		base.recordErrorResult();		
		
		base.svc();

		base.error.message.should.equal('JSON Error for '+ base.file.path +', SyntaxError: Unexpected token n in JSON at position 1');
	})	
	
	it('should error when the schema file is not present for the json', function() {
	
		base.mockTemplateSettings(() => {
			return {
				path: "path"
			 }
		}, () => {});
		
		base.recordErrorResult();

		base.svc();
		base.error.message.should.equal('Schema file not found in the parent directory for path');
	})		
		
});