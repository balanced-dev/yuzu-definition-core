var empty = require('../../modules/json-schema-empty/index').default;
var expect = require("chai").expect;

var throwing = function (schema, err = Error) {
  var f = function () {
    return empty(schema);
  };

  expect(f).to.throw(err);
};


module.exports = function () {
  describe('errors', function () {

    it('should error on unknown type', function (done) {
      throwing({
        type: 'bla'
      });
      done();
    });

    it('should error when no schema is passed', function (done) {
      throwing();
      done();
    });

    it('should throw when invalid schema is passed', function (done) {
      throwing({});
      done();
    });

  });
}
