var rewire = require('rewire'); 

var expect = require('chai').expect;
var webpackDist = rewire('../../modules/webpack/yuzuWebpackDist');

webpackDist.__set__(
	{
		build: {
			resolveDataString: source => source
		}
	}
);

var createFsMock = function (readFileSync, witeFileSync) {
	webpackDist.__set__(
		{
			fs:{
				readFileSync: readFileSync,
				writeFileSync: witeFileSync
			}
		}
	);
}

var dir = '';
var fileList = [];

describe('webpack dist service', function () {
	describe('can resolve page data', function () {

		beforeEach(function () {
			fileList = [];
		});

		it('should add data file', function () {

            let dataFile = "\\pages\\pageHeader\\data\\parPageHeader.json";
            let source = JSON.stringify({});
			let output = {};

			createFsMock(null, (filename, data) => { 
				output.data = data; 
				output.filename = filename
			});

			webpackDist(dataFile, source, [], []);

			expect(output.data).to.equal(source);
			expect(output.filename).to.equal('/data/parPageHeader.json');
        })
        
        it('should add data file2', function () {

			var readFileSync = function(filename, format) {
				var data = JSON.stringify({
					"type": "object"
				});
				if(filename === "dir\\pageHeader\\parPageHeader.schema") {
					return data;
				}
			}

            createFsMock(readFileSync);

			var output = webpackDist(dir);

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
});
