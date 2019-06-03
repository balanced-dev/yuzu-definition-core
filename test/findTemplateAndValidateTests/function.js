var base = require('./base.js'),
S = require('string'),
should = require('should')
schema = require('../data/schema.json'),
data = require('../data/data.json');


describe('findTemplateAndValidate function', function() {	
	
	beforeEach(base.beforeEachFn);	
	
	it('should swap out the data content for the template content from the parent directory', function() {
		
		base.mockFilesAndSchema(data.base, schema.base);
		
		base.findTemplateAndValidate();
		
		base.file.contents.toString().should.equal('<h1>Template</h1>');
	})	
	
	it('should change extension to hbs so that handlebars renders', function() {
		
		base.mockFilesAndSchema(data.base, schema.base);
		
		base.findTemplateAndValidate();
		
		base.file.path.should.equal('c:/templates/parHeader/data/template_data.hbs')
	})		
	
	it('should add a default layout of layout', function() {
		
		base.mockFilesAndSchema(data.base, schema.base);
		
		base.findTemplateAndValidate();
		
		base.file.layout.should.equal('layout')
	})		
	
	it('should change layout file when in json file as an extension', function() {
		
		base.mockFilesAndSchema(data.base, schema.base, 'c:/templates/parHeader/data/template_data.layout2.json');
		
		base.findTemplateAndValidate();
		
		base.file.layout.should.equal('layout2');
	})	
	
	it('should change layout file when directory path contains dot', function() {
		
		base.mockFilesAndSchema(data.base, schema.base, 'c:/templates/parHeader/data.layout/template_data.layout2.json');
		
		base.findTemplateAndValidate();
		
		base.file.layout.should.equal('layout2');
	})			
});	