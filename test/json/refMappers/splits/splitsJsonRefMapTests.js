var S = require('string'),
	assert = require("assert");
	should = require('should'),
	jsonHelper = require('../../../../modules/json/jsonService');

var config = {};
config.refMapper = require('../../../../modules/json/refMappers/refsAsSplits');
config.deepclone = true;

describe('json service splits schema refMaps tests', function () {

	it('json splits - multiple states', function (done) {

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

		var results = jsonHelper.resolveComponentJson(data, config);

		var debug = JSON.stringify(results.refMap, null, 4);

		var expected = {
			"child": {
				"child": {
					"data": {
						"title": "state1"
					},
					"paths": [
						"/child1"
					]
				},
				"child_new-state": {
					"data": {
						"title": "state2"
					},
					"paths": [
						"/child2"
					]
				}
			}
		};

		var state1 = results.refMap.child.child;
		var state2 = results.refMap.child['child_new-state'];

		assert.equal(config.external["/child"], state1.data);
		assert.equal(config.external["/child_new-state"], state2.data);
		assert.equal("/child1", state1.paths[0]);
		assert.equal("/child2", state2.paths[0]);

		done();

	})

	it('json splits - multiple types', function (done) {

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

		var results = jsonHelper.resolveComponentJson(data, config);

		var debug = JSON.stringify(results.refMap, null, 4);

		var expected = {
			"child": {
				"child": {
					"data": {
						"title": "type1"
					},
					"paths": [
						"/child1"
					]
				}
			},
			"child2": {
				"child2": {
					"data": {
						"title": "type2"
					},
					"paths": [
						"/child2"
					]
				}
			}
		};

		var type1 = results.refMap.child.child;
		var type2 = results.refMap.child2.child2;

		assert.equal(config.external["/child"], type1.data);
		assert.equal(config.external["/child2"], type2.data);
		assert.equal("/child1", type1.paths[0]);
		assert.equal("/child2", type2.paths[0]);

		done();

	})

	it('json splits - sub block', function (done) {

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

		var results = jsonHelper.resolveComponentJson(data, config);

		var debug = JSON.stringify(results.refMap, null, 4);

		var expected = {
			"child": {
				"child": {
					"data": {
						"vm": { "$ref": "/sub" }
					},
					"paths": [
						"/child1"
					]
				}
			},
			"sub": {
				"sub": {
					"data": {
						"title": "type"
					},
					"paths": [
						"/child1/vm"
					]
				}
			}
		}

		var type1 = results.refMap.child.child;
		var type2 = results.refMap.sub.sub;

		assert.equal(config.external["/sub"], type2.data);
		assert.equal("/child1/vm", type2.paths[0]);

		done();

	})

	it('splits - sub sub object', function (done) {

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

		var results = jsonHelper.resolveComponentJson(data, config);

		var debug = JSON.stringify(results.refMap, null, 4);

		var exptected = {
			"child": {
				"child": {
					"data": {},
					"paths": [
						"/child/grandchild/child1"
					]
				},
				"child_new-state": {
					"data": {},
					"paths": [
						"/child/grandchild/child2"
					]
				}
			}
		}

		var state1 = results.refMap.child.child;
		var state2 = results.refMap.child['child_new-state'];

		assert.equal("/child/grandchild/child1", state1.paths[0]);
		assert.equal("/child/grandchild/child2", state2.paths[0]);

		done();

	})

	it('json splits - array', function (done) {

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

		var results = jsonHelper.resolveComponentJson(data, config);

		var debug = JSON.stringify(results.refMap, null, 4);

		var expected = {
			"child": {
				"child": {
					"data": {},
					"paths": [
						"/child1[0]"
					]
				},
				"child_new-state": {
					"data": {},
					"paths": [
						"/child2[1]"
					]
				}
			}
		};

		var state1 = results.refMap.child.child;
		var state2 = results.refMap.child['child_new-state'];

		assert.equal("/child[0]", state1.paths[0]);
		assert.equal("/child[1]", state2.paths[0]);

		done();

	});

	it('json splits - array item with sub block', function (done) {

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

		var results = jsonHelper.resolveComponentJson(data, config);

		var debug = JSON.stringify(results.refMap, null, 4);

		var expected = {
			"child": {
				"child": {
					"data": {
						"title": "state1"
					},
					"paths": [
						"/child1[0]"
					]
				},
				"child_new-state": {
					"data": {
						"title": "state2"
					},
					"paths": [
						"/child2[1]"
					]
				}
			},
			"sub": {
				"sub": {
					"data": {
						"title": "type"
					},
					"paths": [
						"/child1[0]/vm",
						"/child1[1]/vm"
					]
				}
			}
		};

		var sub = results.refMap.sub.sub;

		assert.equal("/child1[0]/vm", sub.paths[0]);
		assert.equal("/child1[1]/vm", sub.paths[1]);

		done();

	})

	it('json splits - array item with sub block as object', function (done) {

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

		var results = jsonHelper.resolveComponentJson(data, config);

		var debug = JSON.stringify(results.refMap, null, 4);

		var exptected = {
			"child": {
				"child": {
					"data": {},
					"paths": [
						"/child1[0]/vm"
					]
				},
				"child_new-state": {
					"data": {},
					"paths": [
						"/child2[1]/vm"
					]
				}
			}
		}

		var state1 = results.refMap.child.child;
		var state2 = results.refMap.child['child_new-state'];

		assert.equal("/child[0]/vm", state1.paths[0]);
		assert.equal("/child[1]/vm", state2.paths[0]);

		done();

	})

});	