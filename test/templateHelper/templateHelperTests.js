var should = require('should'),
S = require('string'),
base = require('./base.js');


describe('templateHelper error', function() {
	
	it('should error when more than one handlebars file is found in parent directory', function() {
	
		base.file.path = 'c:/templates/parHeader/data/template_data.json';
		dir = 'c:\\templates\\parHeader';
	
		var readdirSync = function(dir) {
			if (dir == dir)
				return ['template.hbs', 'template2.hbs']
		}
		base.createFsMock(readdirSync);
		
		var output = base.svc.GetTemplateSettings(base.file);
		output.error.should.equal('More than one Handlebars file found at '+ dir);
	})		
	
	it('should error when more than one schema file is found in parent directory', function() {
	
		base.file.path = 'c:/templates/parHeader/data/template_data.json';
		dir = 'c:\\templates\\parHeader';
	
		var readdirSync = function(dir) {
			if (dir == dir)
				return ['data.schema', 'data2.schema']
		}
			
		base.createFsMock(readdirSync);
		
		var output = base.svc.GetTemplateSettings(base.file);
		output.error.should.equal('More than one Json Schema file found at '+ dir);	
	})			
	
});