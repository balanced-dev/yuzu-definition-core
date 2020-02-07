var should = require('should'),
	S = require('string'),
	assert = require('assert'),
	base = require('./base.js')
	errors = [];

describe('block files service', function () {
	describe('get', function () {

		it('should get template file and add to output', function () {

			base.file.path = 'c:/templates/parHeader/data/template_data.json';

			var readdirSync = function (dir) {
				return ['template.hbs']
			}
			var readfileSync = function (file) {
				return 'file';
			}

			base.createFsMock(readdirSync, readfileSync);

			var output = base.svc.Get('', errors);
			output.template.should.equal('file');
		})

		it('should get block layout file and add to output', function () {

			base.file.path = 'c:/templates/parHeader/data/template_data.json';

			var readdirSync = function (dir) {
				return ['blockLayout.layout']
			}
			var readfileSync = function (file) {
				return 'layout';
			}

			base.createFsMock(readdirSync, readfileSync);

			var output = base.svc.Get('', errors);
			output.blockLayout.should.equal('layout');
		})

		it('should parse schema file and add to output', function () {

			base.file.path = 'c:/templates/parHeader/data/template_data.json';

			var readdirSync = function (dir) {
				return ['data.schema']
			}
			var readfileSync = function (file) {
				return '{}';
			}

			base.createFsMock(readdirSync, readfileSync);

			var output = base.svc.Get('', errors);
			assert.deepEqual(output.schema, {});
		})

		it('should add _modifiers to the schema', function () {

			base.file.path = 'c:/templates/parHeader/data/template_data.json';

			var readdirSync = function (dir) {
				return ['data.schema']
			}
			var readfileSync = function (file) {
				return JSON.stringify(
					{
						"type": "object",
						"properties": {}
					}
				);
			}

			base.createFsMock(readdirSync, readfileSync);

			var output = base.svc.Get('', errors);
			output.schema.properties["_modifiers"].type.should.equal('string');
		})

		describe(' errors', function () {

			beforeEach(function() {
				errors = [];
			});

			it('should error when more than one handlebars file is found in parent directory', function () {

				base.file.path = 'c:/templates/parHeader/data/template_data.json';
				dir = 'c:\\templates\\parHeader';
	
				var readdirSync = function (dir) {
					return ['template.hbs', 'template2.hbs']
				}
				base.createFsMock(readdirSync);
	
				base.svc.Get(base.file.path, errors);
				errors.length.should.equal(1);
				errors[0].message.should.equal('More than one Handlebars file found');
			})
	
			it('should error when more than one schema file is found in parent directory', function () {
	
				base.file.path = 'c:/templates/parHeader/data/template_data.json';
				dir = 'c:\\templates\\parHeader';
	
				var readdirSync = function (dir) {
					return ['data.schema', 'data2.schema']
				}
	
				base.createFsMock(readdirSync);
	
				base.svc.Get(base.file.path, errors);
				errors.length.should.equal(1);
				errors[0].message.should.equal('More than one Json Schema file found');
			})

			it('should error when schema file is not valid', function () {

				base.file.path = 'c:/templates/parHeader/data/template_data.json';
				dir = 'c:\\templates\\parHeader';
	
				var readdirSync = function (dir) {
					return ['data.schema']
				}
				var readfileSync = function (file) {
					return '{fierui';
				}
	
				base.createFsMock(readdirSync, readfileSync);
	
				base.svc.Get(base.file.path, errors);
				
				errors.length.should.equal(2);
				errors[0].message.should.equal('Unexpected token f in JSON at position 1');
				errors[1].message.should.equal('Cannot parse file : data.schema');
			})
	
		});

	});
});