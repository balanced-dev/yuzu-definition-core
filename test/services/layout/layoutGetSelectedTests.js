var S = require('string'),
	should = require('should'),
	rewire = require('rewire'),
	svc = rewire('../../../modules/services/layoutService.js');;


describe('layout service', function () {
	describe('get selected layout', function () {

		it('should add a default layout of layout', function () {

			var path = 'c:\\templates\\parHeader\\data\\template_data.json';

			var output = svc.GetSelectedLayout(path);

			output.name.should.equal('_page');
			output.data.should.equal('_page');
		})

		it('should change layout file when block data contains layout property', function () {

			var path = 'c:\\templates\\parHeader\\data\\template_data.json';
			var data = {
				_layout: {
					name: 'layout2',
					data: 'layout2_data'
				}
			};

			var output = svc.GetSelectedLayout(path, data);

			output.name.should.equal('layout2');
			output.data.should.equal('layout2_data');
		})

		it('should change default layout file to block when in block directory', function () {

			var path = 'c:\\templates\\blocks\\parHeader\\template_data.layout2.json';

			var output = svc.GetSelectedLayout(path);

			output.name.should.equal('_block');
			output.data.should.equal('_block');
		})

	});
});