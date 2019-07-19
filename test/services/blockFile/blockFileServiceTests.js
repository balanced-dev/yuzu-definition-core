var should = require('should'),
	S = require('string'),
	assert = require('assert'),
	base = require('./base.js');

describe('block files service', function () {
	describe('get', function () {

		it('should error when more than one handlebars file is found in parent directory', function () {

			base.file.path = 'c:/templates/parHeader/data/template_data.json';
			dir = 'c:\\templates\\parHeader';

			var readdirSync = function (dir) {
				return ['template.hbs', 'template2.hbs']
			}
			base.createFsMock(readdirSync);

			var output = base.svc.Get(base.file.path);
			output.error.should.equal('More than one Handlebars file found at ' + dir);
		})

		it('should error when more than one schema file is found in parent directory', function () {

			base.file.path = 'c:/templates/parHeader/data/template_data.json';
			dir = 'c:\\templates\\parHeader';

			var readdirSync = function (dir) {
				return ['data.schema', 'data2.schema']
			}

			base.createFsMock(readdirSync);

			var output = base.svc.Get(base.file.path);
			output.error.should.equal('More than one Json Schema file found at ' + dir);
		})

		it('should get template file and add to ouput', function () {

			base.file.path = 'c:/templates/parHeader/data/template_data.json';

			var readdirSync = function (dir) {
				return ['template.hbs']
			}
			var readfileSync = function (file) {
				return 'file';
			}

			base.createFsMock(readdirSync, readfileSync);

			var output = base.svc.Get('');
			output.template.should.equal('file');
		})

		it('should get block layout file and add to ouput', function () {

			base.file.path = 'c:/templates/parHeader/data/template_data.json';

			var readdirSync = function (dir) {
				return ['blockLayout.layout']
			}
			var readfileSync = function (file) {
				return 'layout';
			}

			base.createFsMock(readdirSync, readfileSync);

			var output = base.svc.Get('');
			output.blockLayout.should.equal('layout');
		})

		it('should parse schema file and add to ouput', function () {

			base.file.path = 'c:/templates/parHeader/data/template_data.json';

			var readdirSync = function (dir) {
				return ['data.schema']
			}
			var readfileSync = function (file) {
				return '{}';
			}

			base.createFsMock(readdirSync, readfileSync);

			var output = base.svc.Get('');
			assert.deepEqual(output.schema, {});
		})

		it('should add @modifier to the schema', function () {

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

			var output = base.svc.Get('');
			output.schema.properties["@modifier"].type.should.equal('string');
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

			var output = base.svc.Get(base.file.path);
			output.error.should.equal('Cannot parse file : data.schema in ' + dir);
		})

	});
});