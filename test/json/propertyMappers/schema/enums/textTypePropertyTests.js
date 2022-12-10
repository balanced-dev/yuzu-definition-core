var S = require('string'),
assert = require("assert");
should = require('should'),
schemeService = require('../../../../../modules/json/jsonSchemaService');

var config = {};
config.propertyMappers = [];
config.propertyMappers.push(require('../../../../../modules/json/propertyMappers/schema/propertyTextType'));


describe('json schema service', function () {
	describe('property maps', function () {
		describe('text type schema', function () {

			it('property', function (done) {
	
				var data = {
					"type": "object",
					"properties": {
						"bodyText": {
							"type": "string",
							"textType": "rte"
						}
					}
				}
	
				var results = schemeService.Resolve_ComponentJsonSchema(data, config);
				var debug = JSON.stringify(results.output.textType, null, 4);
	
				var expected = {
					"/bodyText": "rte"
				};
	
				assert.deepEqual(expected, results.output.textType);
	
				done();
			})

			it('object', function (done) {
	
				var data = {
					"type": "object",
					"properties": {
						"obj": {
							"type": "object",
							"properties": {
								"bodyText": {
									"type": "string",
									"textType": "rte"
								},
							}
						}
					}
				}
	
				var results = schemeService.Resolve_ComponentJsonSchema(data, config);
				var debug = JSON.stringify(results.output.textType, null, 4);
	
				var expected = {
					"/obj/bodyText": "rte"
				};
	
				assert.deepEqual(expected, results.output.textType);
	
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
									"bodyText": {
										"type": "string",
										"textType": "rte"
									},
								}
							}
						}
					}
				}
	
				var results = schemeService.Resolve_ComponentJsonSchema(data, config);
				var debug = JSON.stringify(results.output.textType, null, 4);
	
				var expected = {
					"/arr/bodyText": "rte"
				};
	
				assert.deepEqual(expected, results.output.textType);
	
				done();
			})

			it('doesnt add to subblock objects', function (done) {
	
				config.external = {
					"/subBlock": {
						"type": "object",
						"properties": {
							"theme": {
								"type": "string",
								"textType": "rte"
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
	
				assert.equal(undefined, results.output.textType);
	
				done();
			})

		});

	});
});