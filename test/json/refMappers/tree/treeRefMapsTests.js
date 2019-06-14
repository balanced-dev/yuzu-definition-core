var S = require('string'),
	assert = require("assert");
	should = require('should'),
	jsonHelper = require('../../../../modules/json/jsonService');


describe('json service tree refMaps tests', function () {

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
	}

	var childSchema = {
		"type": "object",
		"properties": {
			"grandchild": {
				"$ref": "/grandchild"
			}
		}
	}

	var grandchild = {
		"type": "object",
		"properties": {}
	  }


	it('schema tree- given a refs required as a tree', function (done) {

		var config = {};
		config.external = {
			"/child": childSchema,
			"/grandchild": grandchild,
		};
		config.refMapper = require('../../../../modules/json/refMappers/refsAsTree');
		config.deepclone = true;

		var results = jsonHelper.resolveComponentJson(schema, config);

		results.refMap.child1.ref.should.equal('/child');
		results.refMap.child1.children.grandchild.ref.should.equal('/grandchild');
		results.refMap.child2.ref.should.equal('/child');
		results.refMap.child2.children.grandchild.ref.should.equal('/grandchild');

		done();

	})

});	