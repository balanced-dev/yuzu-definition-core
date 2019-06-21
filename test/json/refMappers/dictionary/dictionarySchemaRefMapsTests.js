var S = require('string'),
	should = require('should'),
	jsonService = require('../../../../modules/json/jsonService');

var config = {};
config.refMapper = require('../../../../modules/json/refMappers/refsAsDictionary');
config.deepclone = true;

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
};

describe('json service', function () {
	describe('refmaps', function () {
		describe('dictionary json', function () {

			it('schema dictionary - given a refs required as a dictionary', function (done) {

				config.external = {
					"/child": childSchema,
					"/grandchild": {
						"type": "object",
						"properties": {}
					}
				};

				var results = jsonService.resolveComponentJson(schema, config);

				var debug = JSON.stringify(results.refMap, null, 4);

				var expceted = {
					"child": {
						"instances": [
							{
								"path": "/child1",
								"state": "/child"
							},
							{
								"path": "/child2",
								"state": "/child"
							}
						]
					},
					"grandchild": {
						"instances": [
							{
								"path": "/child1/grandchild",
								"state": "/grandchild"
							},
							{
								"path": "/child2/grandchild",
								"state": "/grandchild"
							}
						]
					}
				};

				var child = results.refMap['child'].instances;
				var grandchild = results.refMap['grandchild'].instances;

				child[0].path.should.equal('/child1');
				child[1].path.should.equal('/child2');
				grandchild[0].path.should.equal('/child1/grandchild');
				grandchild[1].path.should.equal('/child2/grandchild');

				done();

			})

		});
	});
});