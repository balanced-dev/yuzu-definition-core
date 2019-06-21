var empty = require('../../modules/json-schema-empty/index').default;
var expect = require("chai").expect;

module.exports = function () {
  describe('boolean schema definition', function () {

    it('should yield false', function (done) {
      var schema = {
        type: 'boolean'
      };

      expect(empty(schema)).to
        .deep.equal(false);

      done();
    });

    it('should work with default', function (done) {
      var schema = {
        type: 'boolean'
        , default: true
      };

      expect(empty(schema)).to
        .deep.equal(true);

      done();
    });
  });
}
