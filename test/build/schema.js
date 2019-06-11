var base = require('./base.js'),
S = require('string'),
should = require('should')
schema = require('../data/schema.json'),
data = require('../data/data.json');

describe('build schema', function() {	
	
	beforeEach(base.beforeEachFn);	
	
	it('should error when the schema file does not parse', function() {	
	
		var schemaInvalid = '{ "id": "/SimplePerson", "type":"object "properties": {"name": {"type": "string"}}, "additionalProperties": false}';	

		base.mockFilesAndSchema(data.base, schemaInvalid);	
		base.recordErrorResult();		
		
		base.svc();
		
		base.file.validated.should.equal(false);	
		base.error.message.should.equal('Cannot parse file : Json Schema in '+ dir );
	})		
	
	it('should validate using schema file', function() {
	
		base.mockFilesAndSchema(data.base, schema.base);	
		base.createThroughMock();
		
		base.svc();
		
		base.file.validated.should.equal(true);	
	})	
	
	it('should error using invalid schema file', function() {
	
		data.base.another = 'test';
	
		base.mockFilesAndSchema(data.base, schema.base);
		base.recordErrorResult();			
		
		base.svc();
		
		base.file.validated.should.equal(false);	
		base.error.message.should.equal('validation on '+ dir +' : additionalProperty "another" exists in instance when not allowed for /SimplePerson');	
	})				
	
	it('should validate and resolve schema file', function() {	

		var externalSchemas = {
			'/SimpleAddress': schema.address
		}
	
		base.mockFilesAndSchema(data.baseAddress, schema.baseRefAddress);
		base.createThroughMock();
		
		base.svc(externalSchemas);
		
		base.file.validated.should.equal(true);	
	})			

	it('should error using invalid resolved schema file', function() {
	
		data.baseAddress.address.postcode = 'M1 2JW';	
	
		var externalSchemas = {
			'/SimpleAddress': schema.address
		}

		base.mockFilesAndSchema(data.baseAddress, schema.baseRefAddress);
		base.recordErrorResult();	

		base.svc(externalSchemas);
		
		data.baseAddress.address.postcode = undefined;
		
		base.file.validated.should.equal(false);	
		base.error.message.should.equal('validation on '+ dir +' : additionalProperty "postcode" exists in instance when not allowed for /SimpleAddress');	
	})				
	
	it('should validate using sub schema files', function() {

		var externalSchemas = {
			'/SimpleAddress': schema.addressRefSub,
			'/SubItem':  schema.sub
		}
	
		var externalDatas = {	}	
	
		base.mockFilesAndSchema(data.baseAddressSub, schema.baseRefAddress);
		base.createThroughMock();
		
		base.svc(externalSchemas, externalDatas);
		
		base.file.validated.should.equal(true);	
	})		
	
	it('should error using invalid sub schema files', function() {
	
		data.baseAddressSub.address.sub.another = "test";
	
		var externalSchemas = {
			'/SimpleAddress': schema.addressRefSub,
			'/SubItem':  schema.sub
		}
	
		var externalDatas = {	}	
	
		base.mockFilesAndSchema(data.baseAddressSub, schema.baseRefAddress);
		base.recordErrorResult();	
		
		base.svc(externalSchemas, externalDatas);
		
		data.baseAddressSub.address.sub.another = undefined;	
		
		base.file.validated.should.equal(false);	
		base.error.message.should.equal('validation on '+ dir +' : additionalProperty "another" exists in instance when not allowed for /SubItem');
	})		
});	
