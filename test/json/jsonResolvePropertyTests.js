var S = require('string'),
	assert = require("assert");
should = require('should'),
	jsonService = require('../../modules/json/jsonService');


describe('json service', function () {
	describe('resolve property settings', function () {

		it('should add back ref property marker for an object when configured', function (done) {

			var config = {};
			config.addRefProperty = true;
			config.external = {
				'/SimpleAddress': {
					"zip": "DC 20500"
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
					"$ref": "/SimpleAddress"
				}
			}

			results.valid.should.equal(true);
			assert.deepEqual(expected, data);

			done();
		})

		it('should add back ref property marker for an array when configured', function (done) {

			var config = {};
			config.addRefProperty = true;
			config.external = {
				'/Address': {
					"zip": "DC 20500"
				},
				'/Phone': {
					"no": "8904309342"
				}
			};

			var data = [
				{ "$ref": "/Address" },
				{ "$ref": "/Phone" }
			]

			var results = jsonService.resolveComponentJson(data, config);
			var debug = JSON.stringify(data, null, 4);
			var expected = [{
				"zip": "DC 20500",
				"$ref": "/Address"
			},
			{
				"no": "8904309342",
				"$ref": "/Phone"
			}]

			results.valid.should.equal(true);
			assert.deepEqual(expected, data);

			done();
		})


		it('should add path property marker for an object when configured', function (done) {

			var config = {};
			config.addPathProperty = true;
			config.external = {
				'/SimpleAddress': {
					"zip": "DC 20500"
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
					"yuzu-path": "/address"
				}
			}

			results.valid.should.equal(true);
			assert.deepEqual(expected, data);

			done();
		})

		it('should add path property marker for an array when configured', function (done) {

			var config = {};
			config.addPathProperty = true;
			config.deepclone = true;
			config.external = {
				'/SimpleAddress': {
					"zip": "DC 20500"
				}
			};

			var data = [
				{ "$ref": "/SimpleAddress" },
				{ "$ref": "/SimpleAddress" }
			]

			var results = jsonService.resolveComponentJson(data, config);
			var debug = JSON.stringify(data, null, 4);
			var expected = [{
				"zip": "DC 20500",
				"yuzu-path": "/[0]"
			},
			{
				"zip": "DC 20500",
				"yuzu-path": "/[1]"
			}]

			results.valid.should.equal(true);
			assert.deepEqual(expected, data);

			done();
		})

	});
});
