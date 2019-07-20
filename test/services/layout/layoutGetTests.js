var S = require('string'),
should = require('should'),
assert = require('assert'),
rewire = require('rewire'),
svc = rewire('../../../modules/services/layoutService.js');

var files = [];

describe('layout service', function () {
	describe('get layouts', function () {

		it('should get a layout', function () {

			files = ['file.hbs']
			var dir = 'c:\\templates\\';

			svc.__set__(
				{ fs:
					{ 
						readdirSync: function (dir) {
							return files;
						},
						readFileSync: (filename) => {
							if(filename == 'c:\\templates\\file.hbs') {
								return 'template'
							}
							else if (filename == 'c:\\templates\\file.json') {
								return '{}'
							}
						}
					}
				}
			)

			var output = svc.GetLayouts(dir);

			output[0].name.should.equal('file');
			output[0].template.should.equal('template');
			assert.deepEqual({}, output[0].data);
		})

		it('should not add layout when data not exist', function () {

			files = ['file.hbs']
			var dir = 'c:\\templates\\';

			svc.__set__(
				{ fs:
					{ 
						readdirSync: function (dir) {
							return files;
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

		xit('should error when layout data not valid', function () {

			files = ['file.hbs']
			var dir = 'c:\\templates\\';

			svc.__set__(
				{ fs:
					{ 
						readdirSync: function (dir) {
							return files;
						},
						readFileSync: (filename) => {
							if(filename == 'c:\\templates\\file.hbs') {
								return 'template'
							}
							else if (filename == 'c:\\templates\\file.json') {
								return 'ieriuwer}'
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