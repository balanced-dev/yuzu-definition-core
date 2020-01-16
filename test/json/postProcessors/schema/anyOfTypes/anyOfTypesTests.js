var S = require('string'),
	assert = require("assert");
should = require('should'),
	schemaHelper = require('../../../../../modules/json/jsonSchemaService');

var config = {};
config.refMapper = require('../../../../../modules/json/refMappers/schema/refsAsTree');
config.postProcessor = require('../../../../../modules/json/postProcessors/schema/anyOfTypes');
config.deepclone = true;


describe('json schema service', function () {
	describe('post processors', function () {
		describe('any of types', function () {

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
				var debug = JSON.stringify(results.output, null, 4);

				var expected = {
					"specificGrid": {
						"refs": {
							"/rows/config": ["/specificGridConfig"],
						}
					},
					"anyOfTypes": ["specificGrid"]
				};

				assert.deepEqual(expected, results.output);

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
				var debug = JSON.stringify(results.output, null, 4);

				var expected = {
					"specificGrid": {
						"refs": {
							"/rows/config": ["/specificGridConfig"]
						}
					},
					"differentGrid": {
						"refs": {
							"/rows/config": ["/differentGridConfig"]
						}
					},
					"anyOfTypes": ["specificGrid", "differentGrid"]
				};

				assert.deepEqual(expected, results.output);

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
				var debug = JSON.stringify(results.output, null, 4);

				var expected = {
					"specificGrid": {
						"refs": {
							"/rows/items": ["/specificGridItem"]
						}
					},
					"anyOfTypes": ["specificGrid"]
				};

				assert.deepEqual(expected, results.output);

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
				var debug = JSON.stringify(results.output, null, 4);

				var expected = {
					"specificGrid": {
						"refs": {
							"/rows/items": ["/specificGridItem","/specificGridItem2"]
						}
					},
					"anyOfTypes": ["specificGrid"]
				};

				assert.deepEqual(expected, results.output);

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
				var debug = JSON.stringify(results.output, null, 4);

				var expected = {
					"specificGrid": {
						"refs": {
							"/rows/items": ["/specificGridItem"]
						}
					},
					"differentGrid": {
						"refs": {
							"/rows/items": ["/differentGridItem"]
						}
					},
					"anyOfTypes": ["specificGrid", "differentGrid"]
				};

				assert.deepEqual(expected, results.output);

				done();

			})

			it('of type with normal array', function (done) {

				config.external = {
					"/dataLink": {
						"type": "object",
						"properties": {}
					}
				};

				var schema = {
					"type": "object",
					"anyOfTypes": ["specificGrid"],
					"properties": {
						"actionLinks": {
							"type": "array",
							"items": {
								"$ref": "/dataLink"
							}
						}
					},
					"id": "/dataGridRows"
				};

				var results = schemaHelper.Resolve_ComponentJsonSchema(schema, config);
				var debug = JSON.stringify(results.output, null, 4);

				var expected = {
					"specificGrid": {
						"refs": {
							"/actionLinks": ["/dataLink"]
						}
					},
					"anyOfTypes": ["specificGrid"]
				};

				assert.deepEqual(expected, results.output);

				done();

			})

		});

	});
});