var empty = require('../../modules/json-schema-empty/index').default;
var expect = require("chai").expect;

module.exports = function () {
  describe('object schema definition', function () {

    it('should create the fields', function (done) {
      var schema = {
        type: 'object'
        , properties: {
          foo: {
            type: 'object'
          }
          , bar: {
            type: 'object'
          }
        }
      };
      expect(empty(schema)).to
        .contain.all.keys(['foo', 'bar']);

      done();
    });

    it('should work with default', function (done) {
      var def = {
        foo: 'bar'
        , baz: 42
      };

      var schema = {
        type: 'object'
        , default: def
      };

      expect(empty(schema)).to
        .deep.equal(def);

      done();
    });


  });
}
