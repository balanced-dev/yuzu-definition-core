var S = require('string'),
	should = require('should')
jsonHelper = require('../../../modules/json/jsonSchemaService');

describe('json schema service', function () {
	describe('validation', function () {

		xit('should error when the schema file does not parse', function () {

			var data = {
				"name": "Test"
			};

			var schemaInvalid = '{ "id": "/SimplePerson", "type":"object "properties": {"name": {"type": "string"}}, "additionalProperties": false}';

			var result = jsonHelper.validateSchema({}, data, schemaInvalid);

			result.errors.length.should.equals == 1;
			result.message.should.equal('Cannot parse file : Json Schema in ' + dir);
		})

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

			var result = jsonHelper.validateSchema({}, data, schema);
			result.errors.length.should.equal(0);
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

			var result = jsonHelper.validateSchema({}, data, schema);

			result.errors.length.should.equal(1);
			result.errors[0].message.should.equal('additionalProperty "another" exists in instance when not allowed');
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

			var result = jsonHelper.validateSchema(externalSchemas, data, schema);

			result.errors.length.should.equal(0);
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

			var result = jsonHelper.validateSchema(externalSchemas, data, schema);

			result.errors.length.should.equal(1);
			result.errors[0].message.should.equal('additionalProperty "postcode" exists in instance when not allowed');
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

			var result = jsonHelper.validateSchema(externalSchemas, data, schema);

			result.errors.length.should.equal(0);
		})

	});
});
