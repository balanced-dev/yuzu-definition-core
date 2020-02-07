var S = require('string'),
	should = require('should')
jsonHelper = require('../../../modules/json/jsonSchemaService');

describe('json schema service', function () {
	describe('validation', function () {

		beforeEach(function() {
			errors = [];
		});

		it('should validate using schema file', function () {

			var data = {
				"name": "Test"
			};

			var schema = {
				"id": "/SimplePerson",
				"type": "object",
				"properties": {
					"name": { "type": "string" }
				},
				"additionalProperties": false
			};

			jsonHelper.validateSchema({}, data, schema, errors);
			errors.length.should.equal(0);
		})

		it('should validate inconsistent types between data and schema', function () {

			var data = {
				"name": "Test"
			};

			var schema = {
				"id": "/SimplePerson",
				"type": "object",
				"properties": {
					"name": { "type": "integer" }
				},
				"additionalProperties": false
			};

			jsonHelper.validateSchema({}, data, schema, errors);
			errors.length.should.equal(1);
			errors[0].message.should.equal('Data value : Test\nSchema property : instance.name\nis not of a type(s) integer');
		})

		it('should error using invalid schema file', function () {

			var data = {
				"name": "Test"
			};

			var schema = {
				"id": "/SimplePerson",
				"type": "object",
				"properties": {
					"name": { "type": "string" }
				},
				"additionalProperties": false
			};

			data.another = 'test';

			jsonHelper.validateSchema({}, data, schema, errors);

			errors.length.should.equal(1);
			errors[0].message.should.equal('additionalProperty "another" exists in instance when not allowed');
		})

		it('should validate and resolve schema file', function () {

			var externalSchemas = {
				'/SimpleAddress': {
					"id": "/SimpleAddress",
					"type": "object",
					"properties": {
						"lines": {
							"type": "array",
							"items": { "type": "string" }
						},
						"zip": { "type": "string" }
					},
					"additionalProperties": false
				}
			};

			var schema = {
				"id": "/SimplePerson",
				"type": "object",
				"properties": {
					"name": { "type": "string" },
					"address": { "$ref": "/SimpleAddress" }
				},
				"additionalProperties": false
			};

			var data = {
				"name": "Test",
				"address": {
					"lines": ["1600 Pennsylvania Avenue Northwest"],
					"zip": "DC 20500",
				}
			};

			jsonHelper.validateSchema(externalSchemas, data, schema, errors);

			errors.length.should.equal(0);
		})

		it('should error using invalid resolved schema file', function () {

			var externalSchemas = {
				'/SimpleAddress': {
					"id": "/SimpleAddress",
					"type": "object",
					"properties": {
						"zip": { "type": "string" }
					},
					"additionalProperties": false
				}
			}

			var schema = {
				"id": "/SimplePerson",
				"type": "object",
				"properties": {
					"name": { "type": "string" },
					"address": { "$ref": "/SimpleAddress" }
				},
				"additionalProperties": false
			};

			var data = {
				"name": "Test",
				"address": {
					"zip": "DC 20500",
				}
			};

			data.address.postcode = 'M1 2JW';

			jsonHelper.validateSchema(externalSchemas, data, schema, errors);

			errors.length.should.equal(1);
			errors[0].message.should.equal('Schema property : instance.address\nadditionalProperty "postcode" exists in instance when not allowed');
		})

		it('should validate using sub schema files', function () {

			var externalSchemas = {
				'/SimpleAddress': {
					"id": "/SimpleAddress",
					"type": "object",
					"properties": {
						"zip": { "type": "string" },
						"sub": { "$ref": "/SubItem" }
					},
					"additionalProperties": false
				},
				'/SubItem': {
					"id": "/SubItem",
					"type": "object",
					"properties": {
						"child": { "type": "string" }
					},
					"additionalProperties": false
				}
			}

			var schema = {
				"id": "/SimplePerson",
				"type": "object",
				"properties": {
					"name": { "type": "string" },
					"address": { "$ref": "/SimpleAddress" }
				},
				"additionalProperties": false
			};

			var data = {
				"name": "Test",
				"address": {
					"zip": "DC 20500",
					"sub": {
						"child": "another sub item"
					}
				}
			};

			jsonHelper.validateSchema(externalSchemas, data, schema, errors);

			errors.length.should.equal(0);
		});

		it('should error when sub schema isnt present', function () {

			var externalSchemas = {}

			var schema = {
				"id": "/SimplePerson",
				"type": "object",
				"properties": {
					"name": { "type": "string" },
					"address": { "$ref": "/SimpleAddress" }
				},
				"additionalProperties": false
			};

			var data = {
				"name": "Test"
			};

			jsonHelper.validateSchema(externalSchemas, data, schema, errors);

			errors.length.should.equal(1);
			errors[0].message.should.equal('schema validation error: no such schema </SimpleAddress>');
		})

		it('should error when schema is empty', function () {

			var externalSchemas = {}

			var data = {
				"name": "Test"
			};

			jsonHelper.validateSchema(externalSchemas, data, undefined, errors);

			errors.length.should.equal(1);
			errors[0].message.should.equal('schema not found');
		})

	});
});
