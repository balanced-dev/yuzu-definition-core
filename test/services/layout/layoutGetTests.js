var S = require('string'),
should = require('should'),
assert = require('assert'),
rewire = require('rewire'),
svc = rewire('../../../modules/services/layoutService.js');
filesvc = rewire('../../../modules/services/fileService.js');

var externals = { 
	data : {}
};
var files = [];
var dataFiles = [];

filesvc.__set__(
	{ fs:
		{ 
			readdirSync: function (dir) {
				return files;
			},
			statSync: function (path) {
				return {
					isDirectory: function () { return false; }
				}
			}
		}
	}
)

describe('layout service', function () {
	describe('get layouts', function () {

		beforeEach(function() {
			files = [];
			dataFiles = [];
		});

		it('should get a layout', function () {

			files = ['file.hbs'];
			dataFiles = ['file.json'];
			var dir = 'c:\\templates\\';

			svc.__set__(
				{ 
					jsonService: { 
						resolveComponentJson : function() {},
						testJSON : function(data) {
							return {
								data: JSON.parse(data)
							}
						},  
					},
					fileService: filesvc,
					fs:
					{ 
						readdirSync: function (dir) {
							return dataFiles;
						},
						readFileSync: (filename) => {
							if(filename == 'c:\\templates\\file.hbs') {
								return 'template'
							}
							else if (filename == 'c:\\templates\\data\\file.json') {
								return '{}'
							}
						}
					}
				}
			)

			var output = svc.GetLayouts(dir, externals);

			output[0].name.should.equal('file');
			output[0].template.should.equal('template');
			output[0].data[0].name.should.equal('file');
			assert.deepEqual({}, output[0].data[0].value);
		})

		it('should not add layout when data not exist', function () {

			files = ['file.hbs']
			var dir = 'c:\\templates\\';

			svc.__set__(
				{ 					
					fileService: filesvc,
					fs:
					{ 
						readdirSync: function (dir) {
							return dataFiles;
						},
						readFileSync: (filename) => {
							if(filename == 'c:\\templates\\file.hbs') {
								return 'template'
							}
						}
					}
				}
			)

			var output = svc.GetLayouts(dir);

			output.length.should.equal(0);
		})

	});
});