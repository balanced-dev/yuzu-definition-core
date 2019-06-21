var empty = require('../../modules/json-schema-empty/index').default;
var expect = require("chai").expect;

module.exports = function () {
  describe('string schema definition', function () {

    it('string schema should yield empty string', function (done) {
      var schema = {
        type: 'string'
      };

      expect(empty(schema)).to
        .deep.equal('');

      done();
    });

    it('string schema with default should work', function (done) {
      var schema = {
        type: 'string'
        , default: 'foo'
      };

      expect(empty(schema)).to
        .deep.equal('foo');

      done();
    });
  });
}
