var S = require('string'),
should = require('should'),
jsonHelper = require('../../modules/jsonHelper/jsonHelper');
data = require('../data/data.json');


describe('jsonhelper component json', function() {		
	
	it('should resolve and validate component json successfully', function(done) {	
		
		var config = {};
		config.external = {
			'/SimpleAddress': data.address 
		};

		var results = jsonHelper.resolveComponentJson(data.baseRefAddress, config);
		
		results.valid.should.equal(true);	

		done();
	})		
	
	it('should error when referenced json component not present', function(done) {
	
		var config = {};
		config.external = {};

		var results = jsonHelper.resolveComponentJson(data.baseRefAddress, config);
		
		results.valid.should.equal(false);			
		results.errors[0].should.equal('Json component reference not found in /address');	

		done();
	})	
	
	it('should resolve and validate sub component json successfully', function(done) {
	
		var config = {};
		config.external = {
			'/SimpleAddress': data.addressRefSub, 
			'/SubItem': data.sub
		};

		var results = jsonHelper.resolveComponentJson(data.addressRefSub, config);
		
		results.valid.should.equal(true); 	
		data.addressRefSub.sub.child.should.equal(data.sub.child);	
		
		done();
    })	
	
	it('should resolve and validate sub component as property of sub json successfully', function(done) {
	
		var config = {};
		config.external = {
			'/SimpleAddress': data.addressRefSubSub, 
			'/SubItem': data.sub
		};

		var results = jsonHelper.resolveComponentJson(data.addressRefSubSub, config);
		
		results.valid.should.equal(true);  	
		data.addressRefSubSub.sub.sub.should.equal(data.sub);	

		done();	
	})	

	it('should error when sub json component not present', function(done) {
	
		var config = {};
		config.external = {
			'/SimpleAddress': data.addressRefSub
		};
		
		var results = jsonHelper.resolveComponentJson(data.baseRefAddress, config);
		
		results.valid.should.equal(false);
		results.errors[0].should.equal('Json component reference not found in /address/sub');
		
		done();
	})	
	
	it('should resolve and validate component json component as part of property successfully', function(done) {	
	
		var config = {};
		config.external = {
			'/SubItem': data.sub 
		};

		var results = jsonHelper.resolveComponentJson(data.variableArrayRefSub, config);
		
		results.valid.should.equal(true);
		data.variableArrayRefSub.array[0].sub.should.equal(data.sub);

		done();
	})	
	
	it('should resolve and validate component array of json components successfully', function() {	
		
		var config = {};
		config.external = {
			'/SubItem': data.sub 
		};
		
		var results = jsonHelper.resolveComponentJson(data.arrayRefSub, config);
		
		results.valid.should.equal(true);
        data.arrayRefSub[0].sub.should.equal(data.sub);
	})
	
	
	it('should resolve and validate component property array of json components successfully', function() {	
	
		var config = {};
		config.external = {
			'/SubItem': data.sub 
		};
		
		var results = jsonHelper.resolveComponentJson(data.variableSubArrayRefSub, config);
		
		results.valid.should.equal(true);	
        data.variableSubArrayRefSub.array[0].should.equal(data.sub);
	})

});	
