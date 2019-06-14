var S = require('string'),
should = require('should'),
jsonService = require('../../modules/json/jsonService');


describe('json service resolve tests', function() {		
	
	it('should error when the content file does not parse as json', function() {

		var data = '{name: "test"}';

		var results = jsonService.testJSON(data);

		results.error.message.should.equal('Unexpected token n in JSON at position 1');
	})	

	it('should resolve and validate component json successfully', function(done) {	
		
		var config = {};
		config.external = {
			'/SimpleAddress': {
				"id": "/SimpleAddress",
				"type": "object",
				"properties": {
					"zip": {"type": "string"},											
				},
				"additionalProperties": false	
			} 
		};

		var data = {
			"name": "Test",
			"address": { "$ref": "/SimpleAddress" }
		}

		var results = jsonService.resolveComponentJson(data, config);
		
		results.valid.should.equal(true);	

		done();
	})		
	
	it('should error when referenced json component not present', function(done) {
	
		var config = {};
		config.external = {};

		var data = {
			"name": "Test",
			"address": { "$ref": "/SimpleAddress" }
		}

		var results = jsonService.resolveComponentJson(data, config);
		
		results.valid.should.equal(false);			
		results.errors[0].should.equal("Json component reference not found in /address for schema /SimpleAddress");	

		done();
	})	
	
	it('should resolve and validate sub component json successfully', function(done) {
	
		var config = {};

		config.external = {
			'/SimpleAddress': {
				"zip": {"type": "string"},	
				"sub": { "$ref": "/SubItem" }						
			},
			'/SubItem': {
				"child": "another sub item"
			} 
		};

		var data = {
			"name": "Test",
			"address": { "$ref": "/SimpleAddress" }
		}

		var results = jsonService.resolveComponentJson(data, config);
		
		results.valid.should.equal(true); 	
		data.address.sub.should.equal(config.external["/SubItem"]);	
		
		done();
    })	
	
	it('should resolve and validate sub component as property of sub json successfully', function(done) {
	
		var config = {};
		config.external = {
			'/SubItem': {
				"child": "another sub item"
			}
		};

		var data = {
			"zip": "DC 20500",
			"sub": { 
				"sub": { "$ref": "/SubItem" }
			 }
		};

		var results = jsonService.resolveComponentJson(data, config);
		
		results.valid.should.equal(true);  	
		data.sub.sub.should.equal(config.external["/SubItem"]);	

		done();	
	})	

	it('should error when sub json component not present', function(done) {
	
		var config = {};
		config.external = {
			'/SimpleAddress': {
				"zip": "DC 20500",
				"sub": { "$ref": "/SubItem" }
			}
		};
		
		var data = {
			"name": "Test",
			"address": { "$ref": "/SimpleAddress" }
		}

		var results = jsonService.resolveComponentJson(data, config);
		
		results.valid.should.equal(false);
		results.errors[0].should.equal("Json component reference not found in /address/sub for schema /SubItem");
		
		done();
	})	
	
	it('should resolve and validate component json component as part of property successfully', function(done) {	
	
		var config = {};
		config.external = {
			'/SubItem': {
				"child": "another sub item"
			} 
		};

		var data = {
			"array": [{
				"name": "Test",
				"sub": { "$ref": "/SubItem" }
			},{
				"name": "Test 2",
				"sub": { "$ref": "/SubItem" }
			}]
		};

		var results = jsonService.resolveComponentJson(data, config);
		
		results.valid.should.equal(true);
		data.array[0].sub.should.equal(config.external["/SubItem"]);

		done();
	})	
	
	it('should resolve and validate component array of json components successfully', function() {	
		
		var config = {};
		config.external = {
			'/SubItem': {
				"child": "another sub item"
			} 
		};
		
		var data = [{
			"name": "Test",
			"sub": { "$ref": "/SubItem" }
		},{
			"name": "Test 2",
			"sub": { "$ref": "/SubItem" }
		}];

		var results = jsonService.resolveComponentJson(data, config);
		
		results.valid.should.equal(true);
        data[0].sub.should.equal(config.external["/SubItem"]);
	})
	
	
	it('should resolve and validate component property array of json components successfully', function() {	
	
		var config = {};
		config.external = {
			'/SubItem': {
				"child": "another sub item"
			} 
		};
		
		var data = {
			"array" : [
				{"$ref": "/SubItem"},
				{"$ref": "/SubItem"}
			]
		} 

		var results = jsonService.resolveComponentJson(data, config);
		
		var debug = JSON.stringify(data, null, 4);

		results.valid.should.equal(true);	
        data.array[0].should.equal(config.external["/SubItem"]);
	})

});	
