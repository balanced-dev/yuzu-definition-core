var S = require('string'),
	assert = require("assert");
should = require('should'),
	schemaHelper = require('../../../../modules/json/jsonSchemaService');

var config = {};
config.refMapper = require('../../../../modules/json/refMappers/schema/refsAsTree');
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
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {};

				assert.deepEqual(expected, results.refMap);

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
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {
					"/child1": ["/child"]
				};

				assert.deepEqual(expected, results.refMap);

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
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {
					"/child1": ["/child"]
				};

				assert.deepEqual(expected, results.refMap);

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
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {
					"/child1": ["/child"], 
					"/child2": ["/child"]
				};

				assert.deepEqual(expected, results.refMap);

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
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {
					"/child1": ["/child"]
				};

				assert.deepEqual(expected, results.refMap);

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
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {
					"/child1": ["/child"]
				};

				assert.deepEqual(expected, results.refMap);

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
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {
					"/child1": ["/child8", "/child9"]
				};

				assert.deepEqual(expected, results.refMap);

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
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {
					"/child1": ["/child8", "/child9"]
				};

				assert.deepEqual(expected, results.refMap);

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
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {
					"/content": ["/dataGrid^specificGrid"]
				};

				assert.deepEqual(expected, results.refMap);

				done();

			})

			it('any of type object', function (done) {

				config.external = {
					"/specificGridConfig": {
						"type": "object",
						"properties": {}
					}
				};

				var schema = {
					"type": "object",
					"anyOfTypes": ["specificGrid"],
					"properties": {
						"rows": {
							"type": "array",
							"items": {
								"type": "object",
								"properties": {
									"config": {
										"anyOf": [
											{
												"$ref": "/specificGridConfig"
											}
										]
									}
								}
							}
						} 
					},
					"id": "/dataGridRows"
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {
					"specificGrid": {
						"/rows/config": ["/specificGridConfig"],
					},
					"anyOfTypes": ["specificGrid"]
				};

				assert.deepEqual(expected, results.refMap);

				done();

			})

			it('any of type multple objects', function (done) {

				config.external = {
					"/specificGridConfig": {
						"type": "object",
						"properties": {}
					},
					"/differentGridConfig": {
						"type": "object",
						"properties": {}
					}
				};

				var schema = {
					"type": "object",
					"anyOfTypes": ["specificGrid", "differentGrid"],
					"properties": {
						"rows": {
							"type": "array",
							"items": {
								"type": "object",
								"properties": {
									"config": {
										"anyOf": [
											{
												"$ref": "/specificGridConfig"
											},
											{
												"$ref": "/differentGridConfig"
											}
										]
									}
								}
							}
						} 
					},
					"id": "/dataGridRows"
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {
					"specificGrid": {
						"/rows/config": ["/specificGridConfig"]
					},
					"differentGrid": {
						"/rows/config": ["/differentGridConfig"]
					},
					"anyOfTypes": ["specificGrid", "differentGrid"]
				};

				assert.deepEqual(expected, results.refMap);

				done();

			})

			it('any of type child any of', function (done) {

				config.external = {
					"/specificGridItems": {
						"type": "array",
						"items": {
							"anyOf": [
								{
									"$ref": "/specificGridItem"
								}
							]
						},
					},
					"/specificGridItem": {
						"type": "object",
						"properties": {}
					}
				};

				var schema = {
					"type": "object",
					"anyOfTypes": ["specificGrid"],
					"properties": {
						"rows": {
							"type": "array",
							"items": {
								"type": "object",
								"properties": {
									"items": {
										"anyOf": [
											{
												"$ref": "/specificGridItems"
											}
										]
									} 
								}
							}
						} 
					},
					"id": "/dataGridRows"
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {
					"specificGrid": {
						"/rows/items": ["/specificGridItem"]
					},
					"anyOfTypes": ["specificGrid"]
				};

				assert.deepEqual(expected, results.refMap);

				done();

			})

			it('any of type multiple item child any of', function (done) {

				config.external = {
					"/specificGridItems": {
						"type": "array",
						"items": {
							"anyOf": [
								{
									"$ref": "/specificGridItem"
								},
								{
									"$ref": "/specificGridItem2"
								}
							]
						},
					},
					"/specificGridItem": {
						"type": "object",
						"properties": {}
					},
					"/specificGridItem2": {
						"type": "object",
						"properties": {}
					}
				};

				var schema = {
					"type": "object",
					"anyOfTypes": ["specificGrid"],
					"properties": {
						"rows": {
							"type": "array",
							"items": {
								"type": "object",
								"properties": {
									"items": {
										"anyOf": [
											{
												"$ref": "/specificGridItems"
											}
										]
									} 
								}
							}
						} 
					},
					"id": "/dataGridRows"
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {
					"specificGrid": {
						"/rows/items": ["/specificGridItem","/specificGridItem2"]
					},
					"anyOfTypes": ["specificGrid"]
				};

				assert.deepEqual(expected, results.refMap);

				done();

			})

			it('any of type multiple type child any of', function (done) {

				config.external = {
					"/specificGridItems": {
						"type": "array",
						"items": {
							"anyOf": [
								{
									"$ref": "/specificGridItem"
								}
							]
						},
					},
					"/differentGridItems": {
						"type": "array",
						"items": {
							"anyOf": [
								{
									"$ref": "/differentGridItem"
								}
							]
						},
					},
					"/specificGridItem": {
						"type": "object",
						"properties": {}
					},
					"/differentGridItem": {
						"type": "object",
						"properties": {}
					}
				};

				var schema = {
					"type": "object",
					"anyOfTypes": ["specificGrid", "differentGrid"],
					"properties": {
						"rows": {
							"type": "array",
							"items": {
								"type": "object",
								"properties": {
									"items": {
										"anyOf": [
											{
												"$ref": "/specificGridItems"
											},
											{
												"$ref": "/differentGridItems"
											}
										]
									} 
								}
							}
						} 
					},
					"id": "/dataGridRows"
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.refMap, null, 4);

				var expected = {
					"specificGrid": {
						"/rows/items": ["/specificGridItem"]
					},
					"differentGrid": {
						"/rows/items": ["/differentGridItem"]
					},
					"anyOfTypes": ["specificGrid", "differentGrid"]
				};

				assert.deepEqual(expected, results.refMap);

				done();

			})

		});

	});
});