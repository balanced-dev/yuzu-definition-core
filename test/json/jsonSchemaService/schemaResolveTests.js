var S = require('string'),
	assert = require("assert");
should = require('should'),
	schemeService = require('../../../modules/json/jsonSchemaService');


describe('json schema service', function () {
	describe('resolving', function () {

		it('should error when referenced schema component not present', function (done) {

			var config = {};
			config.external = {};

			var data = {
				"type": "object",
				"properties": {
					"name": "Test",
					"address": { "$ref": "/SimpleAddress" }
				}
			}

			var results = schemeService.Resolve_ComponentJsonSchema(data, config);

			results.valid.should.equal(false);
			results.errors[0].should.equal("Json schema component reference not found in /address for schema /SimpleAddress");

			done();
		})

		it('should remove anyof when asked', function (done) {

			var config = {};
			config.removeAnyOf = true;
			config.external = {};

			var schema = {
				"type": "object",
				"properties": {
					"child1": {
						"type": "array",
						"items": {
							"anyOf": [
								{
									"$ref": "/child8"
								},
								{
									"$ref": "/child9"
								}
							]
						}
					},
					"child2": {
						"anyOf": [
							{
								"$ref": "/child8"
							},
							{
								"$ref": "/child9"
							}
						]
					}
				}
			};

			schemeService.Resolve_ComponentJsonSchema(schema, config);

			var expected = {
				"type": "object",
				"properties": {
					"child1": {
						"type": "array",
						"items": {
							"anyOf": []
						}
					},
					"child2": {
						"anyOf": []
					}
				}
			};

			assert.deepEqual(expected, schema);

			done();
		})

		it('should remove anyof in child object when asked', function (done) {

			var config = {};
			config.removeAnyOf = true;
			config.external = {};

			var schema = {
				"type": "object",
				"properties": {
					"child": {
						"type": "object",
						"properties": {
							"child1": {
								"type": "array",
								"items": {
									"anyOf": [
										{
											"$ref": "/child8"
										},
										{
											"$ref": "/child9"
										}
									]
								}
							},
							"child2": {
								"anyOf": [
									{
										"$ref": "/child8"
									},
									{
										"$ref": "/child9"
									}
								]
							}
						}
					}
					
				}
			};

			schemeService.Resolve_ComponentJsonSchema(schema, config);
			var debug = JSON.stringify(schema, null, 4);

			var expected = {
				"type": "object",
				"properties": {
					"child": {
						"type": "object",
						"properties": {
							"child1": {
								"type": "array",
								"items": {
									"anyOf": []
								}
							},
							"child2": {
								"anyOf": []
							}
						}
					}
				}
			};

			assert.deepEqual(expected, schema);

			done();
		})

		it('should add file path to schema meta when present', function (done) {

			var config = {};
			config.filePath = 'filePath';

			var results = schemeService.Resolve_ComponentJsonSchema({}, config);

			results.output.path.should.equal(config.filePath);

			done();
		})

	});
});
