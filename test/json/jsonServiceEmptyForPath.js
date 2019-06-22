var S = require('string'),
	assert = require("assert"),
	should = require('should'),
	jsonService = require('../../modules/json/jsonService');


describe('json service', function () {
	describe('get empty for path', function () {

		it('should get empty instance for a schema', function () {

			var externals = {};
			externals.schema = {
				"/parBlock": {
					"type": "object",
					"properties": {
						"title": {
							"type": "string"
						},
					}
				}
			};

			var results = jsonService.getEmpty("/parBlock", externals);

			var expected = {
				title: ""
			}

			assert.deepEqual(expected, results);
		});

		it('should error on path as object or array not found', function () {

			var externals = {};
			externals.schemas = {
				"/parBlock": {
					"type": "object",
					"properties": {
						"members": {
							"type": "string",
						}
					}
				}
			};

			var f = function () {
				jsonService.getEmpty("/parBlock", externals, "members");
			};

			assert.throws(f);

		})

		it('should error on path as property not found', function () {

			var externals = {};
			externals.schema = {
				"/parBlock": {
					"type": "object",
					"properties": {
						"members": {
							"type": "string",
						}
					}
				}
			};

			var f = function () {
				jsonService.getEmpty("/parBlock", externals, "notfound");
			};

			assert.throws(f);

		})

		it('should get empty from root array object', function () {

			var externals = {};
			externals.schema = {
				"/parBlock": {
					"type": "object",
					"properties": {
						"members": {
							"type": "array",
							"items": {
								"type": "object",
								"properties": {
									"title": {
										"type": "string"
									}
								}
							}
						},
					}
				}
			};

			var results = jsonService.getEmpty("/parBlock", externals, "members");

			var expected = {
				title: ""
			}

			assert.deepEqual(expected, results);
		})

		it('should get empty from root array ref', function () {

			var externals = {};
			externals.schema = {
				"/parDataLink": {
					"type": "object",
					"properties": {
						"src": {
							"type": "string"
						}
					}
				},
				"/parBlock": {
					"type": "object",
					"properties": {
						"members": {
							"type": "array",
							"items": {
								"$ref": "/parDataLink"
							}
						},
					}
				}
			};

			var results = jsonService.getEmpty("/parBlock", externals, "members");

			var expected = {
				src: ""
			}

			assert.deepEqual(expected, results);
		})

		it('should get empty from root array ref', function () {

			var externals = {};
			externals.schema = {
				"/parBlock": {
					"type": "object",
					"properties": {
						"members": {
							"type": "array",
							"items": {
								"$ref": "/parDataLink"
							}
						},
					}
				}
			};

			var results = jsonService.getEmpty("/parBlock", externals, "members");

			var expected = {
				src: ""
			}

			assert.deepEqual(expected, results);
		})

		it('should get empty from array in object', function () {

			var externals = {};
			externals.schema = {
				"/parBlock": {
					"type": "object",
					"properties": {
						"team": {
							"type": "object",
							"properties": {
								"members": {
									"type": "array",
									"items": {
										"type": "object",
										"properties": {
											"title": {
												"type": "string"
											},
										}
									}
								}
							}
						},
					}
				}
			};

			var results = jsonService.getEmpty("/parBlock", externals, "team/members");

			var expected = {
				title: ""
			}

			assert.deepEqual(expected, results);
		})

		it('should get empty from array in array', function () {

			var externals = {};
			externals.schema = {
				"/parBlock": {
					"type": "object",
					"properties": {
						"teams": {
							"type": "array",
							"items": {
								"type": "object",
								"properties": {
									"members": {
										"type": "array",
										"items": {
											"type": "object",
											"properties": {
												"title": {
													"type": "string"
												},
											}
										}
									}
								}
							}
						}
					},
				}
			};

			var results = jsonService.getEmpty("/parBlock", externals, "teams/members");

			var expected = {
				title: ""
			}

			assert.deepEqual(expected, results);
		})

	});

});


// empty for a subblock new state  (ref name and externals)
// empty for a subblock array new item state (ref name and externals)
// empty for a property array new item (path to property and externals)
