var empty = require('../../modules/json-schema-empty/index').default;
var expect = require("chai").expect;

module.exports = function () {
  describe('numbers', function () {
    it('should return 0 when possible', function (done) {
      var schema = {
        type: 'number'
      };

      expect(empty(schema)).to
        .equal(0);
      done();
    });

    it('should use default', function (done) {
      var schema = {
        type: 'number'
        , default: 42
      };

      expect(empty(schema)).to
        .equal(42);
      done();
    });

  });
}
