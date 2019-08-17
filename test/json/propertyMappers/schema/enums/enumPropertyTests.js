var S = require('string'),
assert = require("assert");
should = require('should'),
schemeService = require('../../../../../modules/json/jsonSchemaService');

var config = {};
config.propertyMappers = [];
config.propertyMappers.push(require('../../../../../modules/json/propertyMappers/schema/propertyEnum'));


describe('json schema service', function () {
	describe('property maps', function () {
		describe('enum schema', function () {

			it('property', function (done) {
	
				var data = {
					"type": "object",
					"properties": {
						"width": {
							"type": "string",
							"enum": ["full","container"]
						}
					}
				}
	
				var results = schemeService.Resolve_ComponentJsonSchema(data, config);
				var debug = JSON.stringify(results.output.enums, null, 4);
	
				var expected = {
					"/width": ['full', 'container']
				};
	
				assert.deepEqual(expected, results.output.enums);
	
				done();
			})

			it('object', function (done) {
	
				var data = {
					"type": "object",
					"properties": {
						"obj": {
							"type": "object",
							"properties": {
								"theme": {
									"type": "string",
									"enum": ["light","dark"]
								},
							}
						}
					}
				}
	
				var results = schemeService.Resolve_ComponentJsonSchema(data, config);
				var debug = JSON.stringify(results.output.enums, null, 4);
	
				var expected = {
					"/obj/theme": ['light', 'dark']
				};
	
				assert.deepEqual(expected, results.output.enums);
	
				done();
			})

			it('array', function (done) {
	
				var data = {
					"type": "object",
					"properties": {
						"arr": {
							"type": "array",
							"items": {
								"type": "object",
								"properties": {
									"position": {
										"type": "string",
										"enum": ["top","middle","bottom"]
									},
								}
							}
						}
					}
				}
	
				var results = schemeService.Resolve_ComponentJsonSchema(data, config);
				var debug = JSON.stringify(results.output.enums, null, 4);
	
				var expected = {
					"/arr/position": ['top', 'middle', 'bottom']
				};
	
				assert.deepEqual(expected, results.output.enums);
	
				done();
			})

			it('doesnt add to subblock objects', function (done) {
	
				config.external = {
					"/subBlock": {
						"type": "object",
						"properties": {
							"theme": {
								"type": "string",
								"enum": ["light","dark"]
							}
						}
					}
				};
	
				var data = {
					"type": "object",
					"properties": {
						"sub": {
							"$ref": "/subBlock",
						},
					}
				}
	
				var results = schemeService.Resolve_ComponentJsonSchema(data, config);
	
				assert.equal(undefined, results.output.enums);
	
				done();
			})

		});

	});
});