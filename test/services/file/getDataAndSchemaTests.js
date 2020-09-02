var rewire = require('rewire'); 
var expect = require('chai').expect;
var fileService = rewire('../../../modules/services/fileService');

var createFsMock = function (readdirSync, readFileSync, statSync) {
	fileService.__set__(
		{
			fs:
			{
				readdirSync: readdirSync,
				readFileSync: readFileSync,
				statSync: statSync
			}
		}
	);
}

var dir = '';
var fileList = [];

describe('file service', function () {
	describe('get data and schema', function () {

		beforeEach(function () {
			fileList = [];
			dir = ['dir/'];
		});

		it('should add schema file', function () {

			var readFileSync = function(filename, format) {
				var data = JSON.stringify({
					"type": "object"
				});
				if(filename === "dir\\pageHeader\\parPageHeader.schema") {
					return data;
				}
			}

			var dirs = {
				'dir/': ['pageHeader'],
				'dir/pageHeader/': ['parPageHeader.schema'],
			}; 

			mockFiles(dirs, readFileSync);

			var output = fileService.getDataAndSchema(dir);

			var expected = {
				"data": {},
				"schema": {
					"/parPageHeader": {
						"type": "object"
					}
				}
			};

			expect(output).to.be.deep.equal(expected);
		})

		it('should add data file in data directory', function () {

			var readFileSync = function(filename, format) {
				var data = JSON.stringify({});
				if(filename === "dir\\pageHeader\\data\\parPageHeader.json") {
					return data;
				}
			}

			var dirs = {
				'dir/': ['pageHeader'],
				'dir/pageHeader/': ['data'],
				'dir/pageHeader/data/': ['parPageHeader.json']
			}; 

			mockFiles(dirs, readFileSync);

			var output = fileService.getDataAndSchema(dir);

			var expected = {
				"schema": {},
				"data": {
					"/parPageHeader": {}
				}
			};

			expect(output).to.be.deep.equal(expected);
		})

		it('should add multiple data files', function () {

			var readFileSync = function(filename, format) {
				var data = JSON.stringify({});
				if(filename === "dir\\pageHeader\\data\\parPageHeader.json") {
					return data;
				}
				if(filename === "dir\\pageHeader\\data\\parPageHeader_state.json") {
					return data;
				}
			}

			var dirs = {
				'dir/': ['pageHeader'],
				'dir/pageHeader/': ['data'],
				'dir/pageHeader/data/': ['parPageHeader.json', 'parPageHeader_state.json']
			}; 

			mockFiles(dirs, readFileSync);

			var output = fileService.getDataAndSchema(dir);

			var expected = {
				"schema": {},
				"data": {
					"/parPageHeader": {},
					"/parPageHeader_state": {}
				}
			};

			expect(output).to.be.deep.equal(expected);
		})

		it('should add multiple blocks', function () {

			var readFileSync = function(filename, format) {
				var data = JSON.stringify({	});
				var schema = JSON.stringify({
					"type": "object"
				});
				if(filename === "dir\\pageHeader\\parPageHeader.schema") {
					return schema;
				}
				if(filename === "dir\\pageHeader\\data\\parPageHeader.json") {
					return data;
				}
				if(filename === "dir\\team\\parTeam.schema") {
					return schema;
				}
				if(filename === "dir\\team\\data\\parTeam.json") {
					return data;
				}
			}

			var dirs = {
				'dir/': ['pageHeader', 'team'],
				'dir/pageHeader/': ['parPageHeader.schema', 'data'],
				'dir/pageHeader/data/': ['parPageHeader.json'],
				'dir/team/': ['parTeam.schema', 'data'],
				'dir/team/data/': ['parTeam.json']
			}; 

			mockFiles(dirs, readFileSync);

			var output = fileService.getDataAndSchema(dir);
			var debug = JSON.stringify(output, null, 4);

			var expected = {
				"schema": {
					"/parPageHeader": {
						"type": "object"
					},
					"/parTeam": {
						"type": "object"
					}
				},
				"data": {
					"/parPageHeader": {},
					"/parTeam": {}
				}
			};

			expect(output).to.be.deep.equal(expected);
		})

		it('should add default root properties to object schema', function () {

			var readFileSync = function(filename, format) {
				if(filename === "dir\\pageHeader\\parPageHeader.schema") {
					return JSON.stringify({
						"type": "object",
						"properties": {}
					});
				}
			}

			var dirs = {
				'dir/': ['pageHeader'],
				'dir/pageHeader/': ['parPageHeader.schema'],
			}; 

			mockFiles(dirs, readFileSync);

			var output = fileService.getDataAndSchema(dir, [
				{
					name: "_ref",
					schema: {
						type: "string"
					}
				},
				{
					name: "yuzuPath",
					schema: {
						type: "object"
					}
				}
			]);
			var debug = JSON.stringify(output, null, 4);

			var expected = {
				"data": {},
				"schema": {
					"/parPageHeader": {
						"type": "object",
					    "properties": {
							"_ref": {
								"type": "string"
							},
							"yuzuPath": {
								"type": "object"
							}
						}
					}
				}
			};

			expect(output).to.be.deep.equal(expected);
		})

		it('shouldnt add default root properties to array schema', function () {

			var readFileSync = function(filename, format) {
				if(filename === "dir\\pageHeader\\parPageHeader.schema") {
					return JSON.stringify({
						"type": "array",
						"items": {}
					});
				}
			}

			var dirs = {
				'dir/': ['pageHeader'],
				'dir/pageHeader/': ['parPageHeader.schema'],
			}; 

			mockFiles(dirs, readFileSync);

			var output = fileService.getDataAndSchema(dir, [
				{
					name: "_ref",
					schema: {
						type: "string"
					}
				}
			]);
			var debug = JSON.stringify(output, null, 4);

			var expected = {
				"data": {},
				"schema": {
					"/parPageHeader": {
						"type": "array",
					    "items": {
						}
					}
				}
			};

			expect(output).to.be.deep.equal(expected);
		})

		it('schema should always have a type', function () {

			var readFileSync = function(filename, format) {
				var data = JSON.stringify({
					"type": "object"
				});
				if(filename === "dir\\pageHeader\\parPageHeader.schema") {
					return data;
				}
			}

			var dirs = {
				'dir/': ['pageHeader'],
				'dir/pageHeader/': ['parPageHeader.schema'],
			}; 

			mockFiles(dirs, readFileSync);

			var output = fileService.getDataAndSchema(dir);

			var expected = {
				"data": {},
				"schema": {
					"/parPageHeader": {
						"type": "object"
					}
				}
			};

			expect(output).to.be.deep.equal(expected);
		})

	})

	describe('get previews filesystem', function () {

		it('should return single state without parent directory', function () {

			var dirs = {
				'_templates/': ['blocks'],
				'_templates/blocks/': ['pageHeader'],
				'_templates/blocks/pageHeader/': ['parPageHeader.html']
			}; 

			mockFiles(dirs);

			var output = fileService.getPreviews('_templates/');

			var expected = {
				"blocks": {
					"pageHeader": {
						"/parPageHeader": "blocks\\pageHeader\\parPageHeader.html"
					}
				}
			};

			expect(output).to.be.deep.equal(expected);

		})

		it('should return multiple states', function () {

			var dirs = {
				'_templates/': ['blocks'],
				'_templates/blocks/': ['pageHeader'],
				'_templates/blocks/pageHeader/': ['parPageHeader.html', 'parPageHeader_state.html']
			}; 

			mockFiles(dirs);

			var output = fileService.getPreviews('_templates/');

			var expected = {
				"blocks": {
					"pageHeader": {
						"/parPageHeader": "blocks\\pageHeader\\parPageHeader.html",
						"/parPageHeader_state": "blocks\\pageHeader\\parPageHeader_state.html"
					}
				}
			};

			expect(output).to.be.deep.equal(expected);

		})

		it('should return multiple blocks', function () {

			var dirs = {
				'_templates/': ['blocks'],
				'_templates/blocks/': ['pageHeader', 'team'],
				'_templates/blocks/pageHeader/': ['parPageHeader.html'],
				'_templates/blocks/team/': ['parTeam.html']
			}; 

			mockFiles(dirs);

			var output = fileService.getPreviews('_templates/');
			var debug = JSON.stringify(output, null, 4);

			var expected = {
				"blocks": {
					"pageHeader": {
						"/parPageHeader": "blocks\\pageHeader\\parPageHeader.html"
					},
					"team": {
						"/parTeam": "blocks\\team\\parTeam.html"
					}
				}
			};

			expect(output).to.be.deep.equal(expected);

		})

		it('should return multiple blocks and states', function () {

			var dirs = {
				'_templates/': ['blocks'],
				'_templates/blocks/': ['pageHeader', 'team'],
				'_templates/blocks/pageHeader/': ['parPageHeader.html', 'parPageHeader_state.html'],
				'_templates/blocks/team/': ['parTeam.html', 'parTeam_state.html']
			}; 

			mockFiles(dirs);

			var output = fileService.getPreviews('_templates/');
			var debug = JSON.stringify(output, null, 4);

			var expected = {
				"blocks": {
					"pageHeader": {
						"/parPageHeader": "blocks\\pageHeader\\parPageHeader.html",
						"/parPageHeader_state": "blocks\\pageHeader\\parPageHeader_state.html"
					},
					"team": {
						"/parTeam": "blocks\\team\\parTeam.html",
						"/parTeam_state": "blocks\\team\\parTeam_state.html"
					}
				}
			};

			expect(output).to.be.deep.equal(expected);

		})

		it('should return areas', function () {

			var dirs = {
				'_templates/': ['blocks'],
				'_templates/blocks/': ['_gridItems'],
				'_templates/blocks/_gridItems/': ['pageHeader'],
				'_templates/blocks/_gridItems/pageHeader/': ['parPageHeader.html']
			}; 

			mockFiles(dirs);

			var output = fileService.getPreviews('_templates/');
			var debug = JSON.stringify(output, null, 4);

			var expected = {
				"blocks": {
					"_gridItems": {
						"pageHeader": {
							"/parPageHeader": "blocks\\_gridItems\\pageHeader\\parPageHeader.html"
						}
					}
				}
			};

			expect(output).to.be.deep.equal(expected);

		})

	})

	describe('get previews file list', function () {

		it('should return single state without parent directory', function () {

			var files = [
				'c:\\websites\\_dev\\_templates\\blocks\\pageHeader\\data\\parPageHeader.json'
			]

			var output = fileService.getPreviewsFileList(files);
			var debug = JSON.stringify(output, null, 4);

			var expected = {
				"blocks": {
					"pageHeader": {
						"/parPageHeader": "?type=blocks&name=PageHeader"
					}
				}
			};

			expect(output).to.be.deep.equal(expected);

		})

		it('should return multiple states', function () {

			var files = [
				'c:\\websites\\_dev\\_templates\\blocks\\pageHeader\\data\\parPageHeader.json',
				'c:\\websites\\_dev\\_templates\\blocks\\pageHeader\\data\\parPageHeader_state.json'
			]

			var output = fileService.getPreviewsFileList(files);
			var debug = JSON.stringify(output, null, 4);

			var expected = {
				"blocks": {
					"pageHeader": {
						"/parPageHeader": "?type=blocks&name=PageHeader",
						"/parPageHeader_state": "?type=blocks&name=PageHeader&state=state"
					}
				}
			};

			expect(output).to.be.deep.equal(expected);

		})

		it('should return multiple blocks', function () {

			var files = [
				'c:\\websites\\_dev\\_templates\\blocks\\pageHeader\\data\\parPageHeader.json',
				'c:\\websites\\_dev\\_templates\\blocks\\team\\data\\parTeam.json'
			]

			var output = fileService.getPreviewsFileList(files);
			var debug = JSON.stringify(output, null, 4);

			var expected = {
				"blocks": {
					"pageHeader": {
						"/parPageHeader": "?type=blocks&name=PageHeader"
					},
					"team": {
						"/parTeam": "?type=blocks&name=Team"
					}
				}
			};

			expect(output).to.be.deep.equal(expected);

		})

		it('should return multiple blocks and states', function () {

			var files = [
				'c:\\websites\\_dev\\_templates\\blocks\\pageHeader\\data\\parPageHeader.json',
				'c:\\websites\\_dev\\_templates\\blocks\\pageHeader\\data\\parPageHeader_state.json',
				'c:\\websites\\_dev\\_templates\\blocks\\team\\data\\parTeam.json',
				'c:\\websites\\_dev\\_templates\\blocks\\team\\data\\parTeam_state.json'
			]

			var output = fileService.getPreviewsFileList(files);
			var debug = JSON.stringify(output, null, 4);

			var expected = {
				"blocks": {
					"pageHeader": {
						"/parPageHeader": "?type=blocks&name=PageHeader",
						"/parPageHeader_state": "?type=blocks&name=PageHeader&state=state"
					},
					"team": {
						"/parTeam": "?type=blocks&name=Team",
						"/parTeam_state": "?type=blocks&name=Team&state=state"
					}
				}
			};

			expect(output).to.be.deep.equal(expected);

		})

		it('should return areas', function () {

			var files = [
				'c:\\websites\\_dev\\_templates\\blocks\\_gridItems\\pageHeader\\data\\parPageHeader.json'
			]

			var output = fileService.getPreviewsFileList(files);
			var debug = JSON.stringify(output, null, 4);

			var expected = {
				"blocks": {
					"_gridItems": {
						"pageHeader": {
							"/parPageHeader": "?type=blocks&area=_gridItems&name=PageHeader"
						}
					}
				}
			};

			expect(output).to.be.deep.equal(expected);

		})

		it('should handle layots', function () {

			var files = [
				'c:\\websites\\_dev\\_templates\\_layouts\\_block\\data\\_block.json'
			]

			var output = fileService.getPreviewsFileList(files);
			var debug = JSON.stringify(output, null, 4);

			var expected = {
				"_layouts": {
					"_block": {
						"/_block": "?type=_layouts&name=_block"
					}
				}
			};

			expect(output).to.be.deep.equal(expected);

		})

	})
});

const mockFiles = function(dirs, readFileSync)
{
	var readdirSync = function (dir) {
		var output = [];
		Object.keys(dirs).forEach(function(item) {
			if (dir == item)
				output = dirs[item]; 
		});
		return output;
	};
	var statSync = function (path) {
		var output = dirs.hasOwnProperty(path +"/");
		return {
			isDirectory: function () { return output; }
		}
	}

	createFsMock(readdirSync, readFileSync, statSync);
}
