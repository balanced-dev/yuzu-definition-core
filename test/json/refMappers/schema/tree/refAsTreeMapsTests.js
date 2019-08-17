var S = require('string'),
assert = require("assert"),
should = require('should'),
schemaHelper = require('../../../../../modules/json/jsonSchemaService');

var config = {};
config.refMapper = require('../../../../../modules/json/refMappers/schema/refsAsTree');
config.deepclone = true;


describe('json schema service', function () {
	describe('refmaps', function () {
		describe('tree schema', function () {

			it('without blocks', function (done) {

				var schema = {
					"type": "object",
					"properties": {
						"title": {
							"type": "string"
						},
						"bodyText": {
							"type": "string"
						}
					}
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.output.refs, null, 4);

				var expected = {};

				assert.deepEqual(expected, results.output.refs);

				done();

			})

			it('simple block', function (done) {

				config.external = {
					"/child": {
						"type": "object",
						"properties": {	}
					}
				};

				var schema = {
					"type": "object",
					"properties": {
						"child1": {
							"$ref": "/child"
						}
					}
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.output.refs, null, 4);

				var expected = {
					"/child1": ["/child"]
				};

				assert.deepEqual(expected, results.output.refs);

				done();

			})

			it('simple array', function (done) {

				config.external = {
					"/child": {
						"type": "object",
						"properties": {	}
					}
				};

				var schema = {
					"type": "array",
					"items": {
						"type": "object",
						"properties": {
							"child1": {
								"$ref": "/child"
							}
						}
					}
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.output.refs, null, 4);

				var expected = {
					"/child1": ["/child"]
				};

				assert.deepEqual(expected, results.output.refs);

				done();

			})

			it('multiple instances', function (done) {

				config.external = {
					"/child": {
						"type": "object",
						"properties": {}
					},
				};

				var schema = {
					"type": "object",
					"properties": {
						"child1": {
							"$ref": "/child"
						},
						"child2": {
							"$ref": "/child"
						}
					}
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.output.refs, null, 4);

				var expected = {
					"/child1": ["/child"], 
					"/child2": ["/child"]
				};

				assert.deepEqual(expected, results.output.refs);

				done();

			})

			it('ignores sub block refs', function (done) {

				config.external = {
					"/child": {
						"type": "object",
						"properties": {
							"grandchild": {
								"$ref": "/grandchild"
							}
						}
					},
					"/grandchild": {
						"type": "object",
						"properties": {}
					},
				};

				var schema = {
					"type": "object",
					"properties": {
						"child1": {
							"$ref": "/child"
						}
					}
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.output.refs, null, 4);

				var expected = {
					"/child1": ["/child"]
				};

				assert.deepEqual(expected, results.output.refs);

				done();

			})

			it('array', function (done) {

				config.external = {
					"/child": {
						"type": "object",
						"properties": {}
					}
				};

				var schema = {
					"type": "object",
					"properties": {
						"child1": {
							"type": "array",
							"items": {
								"$ref": "/child"
							}
						}
					}
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.output.refs, null, 4);

				var expected = {
					"/child1": ["/child"]
				};

				assert.deepEqual(expected, results.output.refs);

				done();

			})

			it('any of', function (done) {

				config.external = {
					"/child8": {
						"type": "object",
						"properties": {}
					},
					"/child9": {
						"type": "object",
						"properties": {}
					}
				};

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
						}
					}
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.output.refs, null, 4);

				var expected = {
					"/child1": ["/child8", "/child9"]
				};

				assert.deepEqual(expected, results.output.refs);

				done();

			})

			it('one of', function (done) {

				config.external = {
					"/child8": {
						"type": "object",
						"properties": {}
					},
					"/child9": {
						"type": "object",
						"properties": {}
					}
				};

				var schema = {
					"type": "object",
					"properties": {
						"child1": {
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

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.output.refs, null, 4);

				var expected = {
					"/child1": ["/child8", "/child9"]
				};

				assert.deepEqual(expected, results.output.refs);

				done();

			})

			it('any of type parent property', function (done) {
				
				config.external = {
					"/dataGrid": {
						"type": "object",
						"properties": { }
					},
				};

				var schema = {
					"type": "object",
					"properties": {
						"content": {
							"$ref": "/dataGrid",
							"anyOfType": "specificGrid"
						}
					}
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.output.refs, null, 4);

				var expected = {
					"/content": ["/dataGrid^specificGrid"]
				};

				assert.deepEqual(expected, results.output.refs);

				done();

			})

		});

	});
});