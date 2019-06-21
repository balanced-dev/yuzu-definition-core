var empty = require('../../modules/json-schema-empty/index').default;
var expect = require("chai").expect;

module.exports = function() {
  describe('ref schema definition', function() {

    it('ref schema should replcate in object', function(done) {
      var schema = {
        $ref: 'string'
      };
      
      expect(empty(schema)["$ref"]).to.equal('string');
      done();
    });
  
  });
} 
