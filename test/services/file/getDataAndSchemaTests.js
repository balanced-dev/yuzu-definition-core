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
			dir = 'dir/';
		});

		it('should add schema file', function () {

			var readFileSync = function(filename, format) {
				var data = JSON.stringify({});
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
					"/parPageHeader": {}
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
				var data = JSON.stringify({});
				if(filename === "dir\\pageHeader\\parPageHeader.schema") {
					return data;
				}
				if(filename === "dir\\pageHeader\\data\\parPageHeader.json") {
					return data;
				}
				if(filename === "dir\\team\\parTeam.schema") {
					return data;
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
					"/parPageHeader": {},
					"/parTeam": {}
				},
				"data": {
					"/parPageHeader": {},
					"/parTeam": {}
				}
			};

			expect(output).to.be.deep.equal(expected);
		})

	})

	describe('get previews', function () {

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

		it('should return subdirectories', function () {

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
