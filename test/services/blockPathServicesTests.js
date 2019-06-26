var expect = require("chai").expect;
var rewire = require('rewire');
var svc = rewire('../../modules/services/blockPathService.js');

describe('block path service', function () {

    describe('blockFromState', function () {

        it('should create block', function (done) {

            var output = svc.blockFromState("/parHeader_state");

            expect(output).to.equal("/parHeader");
            done();
        });

        it('should remove prefix of /', function (done) {

            var output = svc.blockFromState("/parHeader_state", true);
            expect(output).to.equal("parHeader");

            output = svc.blockFromState("parHeader_state", true);
            expect(output).to.equal("parHeader");

            done();
        });

    });

    describe('buildNewBlockPath', function () {

        it('should create new path using default state', function (done) {

            var paths = {
                "/parHeader": "c:\\test\\_blocks\\parHeader\\parHeader.json"
            }

            var output = svc.buildNewBlockPath("/parHeader_state", paths);

            expect(output).to.equal("c:\\test\\_blocks\\parHeader\\parHeader_state.json");
            done();
        });
        
    });

});