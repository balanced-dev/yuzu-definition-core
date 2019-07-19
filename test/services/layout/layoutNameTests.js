var S = require('string'),
	should = require('should'),
	rewire = require('rewire'),
	svc = rewire('../../../modules/services/layoutService.js');;


describe('layout service', function () {
	describe('get layout name', function () {

		it('should add a default layout of layout', function () {

			var path = 'c:\\templates\\parHeader\\data\\template_data.json';

			var output = svc.GetLayoutName(path);

			output.should.equal('layout')
		})

		it('should change layout file when in json file as an extension', function () {

			var path = 'c:\\templates\\parHeader\\data\\template_data.layout2.json';

			var output = svc.GetLayoutName(path);

			output.should.equal('layout2');
		})

		it('should change layout file when directory path contains dot', function () {

			var path = 'c:\\templates\\parHeader\\data.layout\\template_data.layout2.json';

			var output = svc.GetLayoutName(path);

			output.should.equal('layout2');
		})

		it('should change layout file to block when in block directory', function () {

			var path = 'c:\\templates\\blocks\\parHeader\\template_data.layout2.json';

			var output = svc.GetLayoutName(path);

			output.should.equal('block');
		})

	});
});