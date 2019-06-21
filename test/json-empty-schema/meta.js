var empty = require('../../modules/json-schema-empty/index').default;
var expect = require("chai").expect;

module.exports = function () {
  describe('meta properties', function () {
    it('should work with oneOf', function (done) {
      var schema = {
        oneOf: [{ type: 'integer' }, { type: 'string' }]
      };

      expect(empty(schema)).to
        .equal(0);

      done();
    });

    it('should work with anyOf', function (done) {
      var schema = {
        anyOf: [{ type: 'integer' }, { type: 'string' }]
      };

      expect(empty(schema)).to
        .equal(0);

      done();
    });

    it('should work with allOf', function (done) {
      var schema = {
        allOf: [{ type: 'integer' }]
      };

      expect(empty(schema)).to
        .equal(0);

      done();
    });

    it('should work for type unions', function (done) {
      var schema = {
        type: ['integer', 'string']
      };

      expect(empty(schema)).to
        .equal(0);

      done();

    });
  });
}

