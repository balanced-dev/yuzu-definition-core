var S = require('string'),
	should = require('should'),
	assert = require('assert'),
	rewire = require('rewire'),
	svc = rewire('../../../modules/services/layoutService.js');;


describe('layout service', function () {
	describe('get layout', function () {

		it('should add a default layout with layout data', function () {

			var path = 'c:\\templates\\parHeader\\data\\template_data.json';
			var layouts = [{
				name: '_page',
				template: 'template',
				data: [
					{
						name: '_page',
						value: {}
					}
				] 
			}];

			var output = svc.GetLayout(path, layouts)

			output.template.should.equal('template');
			assert.deepEqual({}, output.data);
		})

		

	});
});