var should = require("should");
var rewire = require('rewire');
var svc = rewire('../../modules/build.js');

var errors = [];

describe('build', function () {

    describe('render state', function () {

        it('should render state without a layout', function (done) {

            var state = '/parBlock_state';
            var partialsRootDir = 'dir';
            var statePath = {
                '/parBlock_state': 'path'
            };
            var externals = {
                data : {
                    '/parBlock_state': {}
                }
            }
            var renderedHtml = 'html';

			svc.__set__(
				{ 
                    fileService:{ 
						getDataAndSchema: function () { return externals; },
						getDataPaths: () => { return statePath; }
                    },
                    build: {
                        getBlockData() { return {}; },
                        resolveJson() {}
                    },
                    renderService: {
                        fromTemplate() { return renderedHtml; }
                    }
				}
			)

            var output = svc.renderState(partialsRootDir, state, errors);
            output.should.equal(renderedHtml);
            externals.layouts.length.should.equal(0);
            done();

        });


    });

});