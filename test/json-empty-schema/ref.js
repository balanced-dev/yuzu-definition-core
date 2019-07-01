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

    it('ref schema should not resolve to ref when data', function(done) {
      var schema = {
        $ref: '/ref'
      };

      var externals = {
        data : {
          "/ref": true,
        },
        schema: {
          "/ref": {
              "type": "boolean"
          }
        }
      }
      
      var output = empty(schema, externals);

      expect(output["$ref"]).to.equal("/ref");
      done();
    });

    it('ref schema should resolve to empty ref when no external data', function(done) {
      var schema = {
        "$ref": "/ref"
      };

      var externals = {
        data : {},
        schema: {
          "/ref": {
              "type": "boolean"
          }
        }
      }
      
      var output = empty(schema, externals);

      expect(output).to.equal(false);
      done();
    });
  
  });
} 
