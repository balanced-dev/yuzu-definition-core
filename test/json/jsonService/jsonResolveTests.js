var S = require('string'),
	assert = require("assert");
should = require('should'),
	jsonService = require('../../../modules/json/jsonService');


describe('json service', function () {
	describe('resolving', function () {

		it('should error when referenced json component not present', function (done) {

			var config = {};
			config.external = {};

			var data = {
				"name": "Test",
				"address": { "$ref": "/SimpleAddress" }
			}

			var results = jsonService.resolveComponentJson(data, config);

			results.valid.should.equal(false);
			results.errors[0].should.equal("Json component reference not found in /address for schema /SimpleAddress");

			done();
		})

		it('should resolve and validate sub component json successfully', function (done) {

			var config = {};

			config.external = {
				'/SimpleAddress': {
					"zip": "DC 20500",
					"sub": { "$ref": "/SubItem" }
				},
				'/SubItem': {
					"child": "another sub item"
				}
			};

			var data = {
				"name": "Test",
				"address": { "$ref": "/SimpleAddress" }
			}

			var results = jsonService.resolveComponentJson(data, config);
			var expected = {
				"name": "Test",
				"address": {
					"zip": "DC 20500",
					"sub": {
						"child": "another sub item"
					}
				}
			};

			results.valid.should.equal(true);
			assert.deepEqual(expected, data);

			done();
		})

		it('should resolve and validate sub component as property of sub json successfully', function (done) {

			var config = {};
			config.external = {
				'/SubItem': {
					"child": "another sub item"
				}
			};

			var data = {
				"zip": "DC 20500",
				"sub": {
					"sub": { "$ref": "/SubItem" }
				}
			};

			var results = jsonService.resolveComponentJson(data, config);
			var expected = {
				"zip": "DC 20500",
				"sub": {
					"sub": {
						"child": "another sub item"
					}
				}
			};

			results.valid.should.equal(true);
			assert.deepEqual(expected, data);

			done();
		})

		it('should error when sub json component not present', function (done) {

			var config = {};
			config.external = {
				'/SimpleAddress': {
					"zip": "DC 20500",
					"sub": { "$ref": "/SubItem" }
				}
			};

			var data = {
				"name": "Test",
				"address": { "$ref": "/SimpleAddress" }
			}

			var results = jsonService.resolveComponentJson(data, config);

			results.valid.should.equal(false);
			results.errors[0].should.equal("Json component reference not found in /address/sub for schema /SubItem");

			done();
		})

		it('should resolve and validate component json component as part of property successfully', function (done) {

			var config = {};
			config.external = {
				'/SubItem': {
					"child": "another sub item"
				}
			};

			var data = {
				"array": [
					{
						"name": "Test",
						"sub": { "$ref": "/SubItem" }
					},
					{
						"name": "Test 2",
						"sub": { "$ref": "/SubItem" }
					}]
			};

			var results = jsonService.resolveComponentJson(data, config);
			var expected = {
				"array": [
					{
						"name": "Test",
						"sub": {
							"child": "another sub item"
						}
					},
					{
						"name": "Test 2",
						"sub": {
							"child": "another sub item"
						}
					}
				]
			};

			results.valid.should.equal(true);
			assert.deepEqual(expected, data);

			done();
		})

		it('should resolve and validate component array of json components successfully', function () {

			var config = {};
			config.external = {
				'/SubItem': {
					"child": "another sub item"
				}
			};

			var data = [
				{
					"name": "Test",
					"sub": { "$ref": "/SubItem" }
				},
				{
					"name": "Test 2",
					"sub": { "$ref": "/SubItem" }
				}];

			var results = jsonService.resolveComponentJson(data, config);
			var expected = [
				{
					"name": "Test",
					"sub": {
						"child": "another sub item"
					}
				},
				{
					"name": "Test 2",
					"sub": {
						"child": "another sub item"
					}
				}
			];

			results.valid.should.equal(true);
			assert.deepEqual(expected, data);
		})


		it('should resolve and validate component property array of json components successfully', function () {

			var config = {};
			config.external = {
				'/SubItem': {
					"child": "another sub item"
				}
			};

			var data = {
				"array": [
					{ "$ref": "/SubItem" },
					{ "$ref": "/SubItem" }
				]
			}

			var results = jsonService.resolveComponentJson(data, config);
			var expected = {
				"array": [
					{
						"child": "another sub item"
					},
					{
						"child": "another sub item"
					}
				]
			};

			results.valid.should.equal(true);
			assert.deepEqual(expected, data);
		})

		it('array of refs', function () {

			var config = {};
			config.external = {
				'/SubItem': {
					"child": "another sub item"
				}
			};

			var data = [
				{ "$ref": "/SubItem" },
				{ "$ref": "/SubItem" }
			]

			var results = jsonService.resolveComponentJson(data, config);
			var expected = [
				{
					"child": "another sub item"
				},
				{
					"child": "another sub item"
				}
			]

			results.valid.should.equal(true);
			assert.deepEqual(expected, data);
		})

	});
});
