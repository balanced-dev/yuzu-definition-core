var empty = require('../../modules/json-schema-empty/index').default;
var expect = require("chai").expect;

module.exports = function () {
  describe('enum schema definition', function () {

    it('should yield first enum value', function (done) {
      var schema = {
        enum: [
          42
        ]
      };

      expect(empty(schema)).to
        .equal(42);

      done();
    });
  });
}
