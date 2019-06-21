var empty = require('../../modules/json-schema-empty/index').default;
var expect = require("chai").expect;

module.exports = function () {
  describe('null schema definition', function () {

    it('should yield null', function (done) {
      var schema = {
        type: 'null'
      };

      expect(empty(schema)).to
        .deep.equal(null);

      done();
    });
  });
}