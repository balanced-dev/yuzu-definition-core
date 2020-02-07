var S = require('string'),
	assert = require("assert");
should = require('should'),
	jsonService = require('../../../modules/json/jsonService');


describe('json service', function () {
	describe('parse', function () {

		beforeEach(function() {
			errors = [];
		});

		it('should resolve and validate component json successfully', function (done) {

			var config = {};
			config.external = {
				'/SimpleAddress': {
					"lines": ["1600 Pennsylvania Avenue Northwest"],
					"zip": "DC 20500",
					"city": "Washington",
					"country": "USA",
				}
			};

			var data = {
				"name": "Test",
				"address": { "$ref": "/SimpleAddress" }
			}

			var results = jsonService.resolveComponentJson(data, errors, config);

			var expected = {
				"name": "Test",
				"address": {
					"lines": [
						"1600 Pennsylvania Avenue Northwest"
					],
					"zip": "DC 20500",
					"city": "Washington",
					"country": "USA"
				}
			};

			results.valid.should.equal(true);
			assert.deepEqual(expected, data);

			done();
		})

		describe(' errors', function () {

			it('should error when the content file does not parse as json', function () {

				var data = '{name: "test"}';
	
				jsonService.testJSON(data, errors);
	
				errors[0].message.should.equal('Unexpected token n in JSON at position 1');
			})

			it('should error when the content file is not plain object or array', function () {

				var data = '"test"';
	
				jsonService.testJSON(data, errors);
	
				errors[0].message.should.equal('Json data must be an plain object or array');
			})
	
		});

	});
});
