var S = require('string');
var assert = require("assert");
var should = require('should');
var jsonHelper = require('../../../../../modules/json/jsonService');

var config = {};
config.refMapper = require('../../../../../modules/json/refMappers/json/refsAsObject');
config.deepclone = true;

describe('json service', function () {
	describe('refmaps', function () {
		describe('object json', function () {

			beforeEach(function() {
				errors = [];
			});

			it('empty', function (done) {

				config.external = {	}

				var data = {}

				var results = jsonHelper.resolveComponentJson(data, errors, config).refMap;

				var expected = {
					"items": []
				}

				assert.deepEqual(expected, results);

				done();

			})

			it('multiple states', function (done) {

				config.external = {
					"/child": {
						"title": "state1"
					},
					"/child_new-state": {
						"title": "state2"
					}
				}

				var data = {
					"child1": {
						"$ref": "/child"
					},
					"child2": {
						"$ref": "/child_new-state"
					},
				}

				var results = jsonHelper.resolveComponentJson(data, errors, config).refMap;

				var expected = {
					"items": [
						{
							"name": "/child",
							"state": {
								"title": "state1"
							}
						},
						{
							"name": "/child_new-state",
							"state": {
								"title": "state2"
							}
						}
					]
				}

				assert.deepEqual(expected, results);

				done();

			})

			it('add used types only', function (done) {

				config.external = {
					"/child": {
						"title": "state1"
					},
					"/child_new-state": {
						"title": "state2"
					}
				}

				var data = {
					"child1": {
						"$ref": "/child"
					}
				}

				var results = jsonHelper.resolveComponentJson(data, errors, config).refMap;

				var expected = {
					"items": [
						{
							"name": "/child",
							"state": {
								"title": "state1"
							}
						}
					]
				}

				assert.deepEqual(expected, results);

				done();

			})

			it('multiple types', function (done) {

				config.external = {
					"/child": {
						"title": "type",
					},
					"/child2": {
						"title": "type2"
					}
				}

				var data = {
					"child1": {
						"$ref": "/child"
					},
					"child2": {
						"$ref": "/child2"
					}
				}

				var results = jsonHelper.resolveComponentJson(data, errors, config).refMap;

				var expected = {
					"items": [
						{
							"name": "/child",
							"state": {
								"title": "type"
							}
						},
						{
							"name": "/child2",
							"state": {
								"title": "type2"
							}
						}
					]
				}

				assert.deepEqual(expected, results);

				done();

			})

			it('sub block', function (done) {

				config.external = {
					"/sub": {
						"title": "type"
					},
					"/child": {
						"vm": { "$ref": "/sub" }
					}
				}

				var data = {
					"child1": { "$ref": "/child" }
				}

				var results = jsonHelper.resolveComponentJson(data, errors, config).refMap;
				var debug = JSON.stringify(results, null, 4);

				var expected = {
					"items": [
						{
							"name": "/child",
							"state": {
								"vm": { "$ref": "/sub" }
							}
						},
						{
							"name": "/sub",
							"state": {
								"title": "type"
							}
						}
					]
				}

				assert.deepEqual(expected, results);

				done();

			})

			it('sub sub object', function (done) {

				config.external = {
					"/child": {},
					"/child_new-state": {}
				}

				var data = {
					"child": {
						"grandchild": {
							"child1": { "$ref": "/child" },
							"child2": { "$ref": "/child_new-state" }
						}
					}
				}

				var results = jsonHelper.resolveComponentJson(data, errors, config).refMap;

				var expected = {
					"items": [
						{
							"name": "/child",
							"state": {	}
						},
						{
							"name": "/child_new-state",
							"state": {	}
						}
					]
				}

				assert.deepEqual(expected, results);

				done();

			})

			it('array', function (done) {

				config.external = {
					"/child": {},
					"/child_new-state": {}
				}

				var data = {
					"child": [
						{ "$ref": "/child" },
						{ "$ref": "/child_new-state" }
					]
				}

				var results = jsonHelper.resolveComponentJson(data, errors, config).refMap;

				var expected = {
					"items": [
						{
							"name": "/child",
							"state": {	}
						},
						{
							"name": "/child_new-state",
							"state": {	}
						}
					]
				}

				assert.deepEqual(expected, results);

				done();

			});

			it('array item with sub block', function (done) {

				config.external = {
					"/sub": {
						"title": "type"
					},
					"/child": {
						"vm": { "$ref": "/sub" }
					},
					"/child_new-state": {
						"vm": { "$ref": "/sub" }
					}
				}

				var data = {
					"child1": [
						{ "$ref": "/child" },
						{ "$ref": "/child_new-state" }
					]
				}

				var results = jsonHelper.resolveComponentJson(data, errors, config).refMap;

				var expected = {
					"items": [
						{
							"name": "/child",
							"state": {	
								"vm": { "$ref": "/sub" }
							}
						},
						{
							"name": "/sub",
							"state": {
								"title": "type"
							}
						},
						{
							"name": "/child_new-state",
							"state": {	
								"vm": { "$ref": "/sub" }
							}
						}
					]
				}

				assert.deepEqual(expected, results);

				done();

			})

			it('array item with sub block as object', function (done) {

				config.external = {
					"/child": {},
					"/child_new-state": {}
				}

				var data = {
					"child": [
						{
							"vm": { "$ref": "/child" }
						},
						{
							"vm": { "$ref": "/child_new-state" }
						},
					]
				}

				var results = jsonHelper.resolveComponentJson(data, errors, config).refMap;
				var debug = JSON.stringify(results, null, 4);

				var expected = {
					"items": [
						{
							"name": "/child",
							"state": {	}
						},
						{
							"name": "/child_new-state",
							"state": {	}
						}
					]
				}

				assert.deepEqual(expected, results);

				done();

			})

		});
	});
});