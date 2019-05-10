var should = require('should'),
S = require('string'),
base = require('./base.js');


describe('findTemplateAndValidate error', function() {
	
	beforeEach(base.beforeEachFn);
	
	it('should error where file is a stream', function() {
	
		base.file.isStream = function() { return true; }

		var emit = function(name, error) {
			name.should.equal('error');
			error.message.should.equal('Streaming not supported');
			error.plugin.should.equal('Find template and validate error');
		}
		
		base.createThroughMock(emit);		
		
		base.findTemplateAndValidate();
	})		
	
	it('should error when the content file does not parse as json', function() {

		base.file.contents = new Buffer('{name: "test"}');
		base.file.path = 'c:/templates/parHeader/data/template_data.json';
	
		base.recordErrorResult();		
		
		base.findTemplateAndValidate();

		base.error.message.should.equal('JSON Error for '+ base.file.path +', SyntaxError: Unexpected token n in JSON at position 1');
	})		
	
	it('should error when more than one handlebars file is found in parent directory', function() {
	
		base.file.path = 'c:/templates/parHeader/data/template_data.json';
		dir = 'c:\\templates\\parHeader';
	
		var readdirSync = function(dir) {
			if (dir == dir)
				return ['template.hbs', 'template2.hbs']
		}

		base.recordErrorResult();	
		base.createFsMock(readdirSync);
		
		base.findTemplateAndValidate();
		base.error.message.should.equal('More than one Handlebars file found at '+ dir);
	})		
	
	it('should error when more than one schema file is found in parent directory', function() {
	
		base.file.path = 'c:/templates/parHeader/data/template_data.json';
		dir = 'c:\\templates\\parHeader';
	
		var readdirSync = function(dir) {
			if (dir == dir)
				return ['data.schema', 'data2.schema']
		}
	
		base.recordErrorResult();		
		base.createFsMock(readdirSync);
		
		base.findTemplateAndValidate();
		base.error.message.should.equal('More than one Json Schema file found at '+ dir);	
	})			
	
	it('should error when the schema file is not present for the json', function() {
	
		base.file.path = 'c:/templates/parHeader/data/template_data.json';
		dir = 'c:\\templates\\parHeader';
	
		var readdirSync = function(dir) {
			if (dir == dir)
				return ['template.hbs']
		}
	
		var readFileSync = function(path, enc) {
			if(path == 'c:\\templates\\parHeader\\template.hbs')
				return '<h1>Template</h1>';				
		}		
	
		base.recordErrorResult();
		base.createFsMock(readdirSync, readFileSync);	
		
		base.findTemplateAndValidate();
		base.error.message.should.equal('Schema file not found in the parent directory for c:\\templates\\parHeader');
	})		
});