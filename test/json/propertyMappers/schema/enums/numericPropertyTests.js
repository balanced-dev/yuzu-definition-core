var S = require('string'),
assert = require("assert");
should = require('should'),
schemeService = require('../../../../../modules/json/jsonSchemaService');

var config = {};
config.propertyMappers = [];
config.propertyMappers.push(require('../../../../../modules/json/propertyMappers/schema/propertyNumeric'));


describe('json schema service', function () {
	describe('property maps', function () {
		describe('numeric schema', function () {

			it('integer', function (done) {
	
				var data = {
					"type": "object",
					"properties": {
						"width": {
							"type": "integer",
						}
					}
				}
	
				var results = schemeService.Resolve_ComponentJsonSchema(data, config);
				var debug = JSON.stringify(results.output.numbers, null, 4);
	
				var expected = {
					"/width": {
						"type": "integer"
					}
				};
	
				assert.deepEqual(expected, results.output.numbers);
	
				done();
			})

			it('numeric', function (done) {
	
				var data = {
					"type": "object",
					"properties": {
						"width": {
							"type": "number",
						}
					}
				}
	
				var results = schemeService.Resolve_ComponentJsonSchema(data, config);
				var debug = JSON.stringify(results.output.numbers, null, 4);
	
				var expected = {
					"/width": {
						"type": "number"
					}
				};
	
				assert.deepEqual(expected, results.output.numbers);
	
				done();
			})


		});

	});
});