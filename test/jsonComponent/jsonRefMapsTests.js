var S = require('string'),
	should = require('should'),
	jsonHelper = require('../../modules/jsonHelper/jsonHelper');


describe('jsonhelper component refMaps', function () {

	var schema = {
		"$schema": "http://json-schema.org/draft-07/schema#",
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
		"$schema": "http://json-schema.org/draft-07/schema#",
		"type": "object",
		"properties": {
			"grandchild": {
				"$ref": "/grandchild"
			}
		}
	}

	var grandchild = {
		"$schema": "http://json-schema.org/draft-07/schema#",
		"type": "object",
		"properties": {}
	  }

	var external = {
		"/child": childSchema,
		"/grandchild": grandchild,
	};


	it('given a refs required as a tree', function (done) {

		var config = {};
		config.external = external;
		config.refMapper = require('../../modules/jsonHelper/services/refsAsTree');
		config.deepclone = true;

		var results = jsonHelper.resolveComponentJson(schema, config);

		results.refMap.child1.ref.should.equal('/child');
		results.refMap.child1.children.grandchild.ref.should.equal('/grandchild');
		results.refMap.child2.ref.should.equal('/child');
		results.refMap.child2.children.grandchild.ref.should.equal('/grandchild');

		done();

	})

	it('given a refs required as a dictionary', function (done) {

		var config = {};
		config.external = external;
		config.refMapper = require('../../modules/jsonHelper/services/refsAsDictionary');
		config.deepclone = true;

		var results = jsonHelper.resolveComponentJson(schema, config);

		results.refMap['/child'].paths[0].should.equal('/child1');
		results.refMap['/child'].paths[1].should.equal('/child2');
		results.refMap['/grandchild'].paths[0].should.equal('/child1/grandchild');
		results.refMap['/grandchild'].paths[1].should.equal('/child2/grandchild');

		done();

	})

});	