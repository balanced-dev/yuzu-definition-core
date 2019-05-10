var base = require('./base.js'),
S = require('string'),
should = require('should')
schema = require('./data/schema.json'),
data = require('./data/data.json');

describe('findTemplateAndValidate component json', function() {	
	
	beforeEach(base.beforeEachFn);	
	
	it('should resolve and validate component json successfully', function() {	
	
		var externalSchemas = {
			'/SimpleAddress': schema.address
		}
	
		var externalDatas = {
			'/SimpleAddress': data.address 
		}	
	
		base.mockFilesAndSchema(data.baseRefAddress, schema.baseRefAddress);
		base.createThroughMock();
		
		base.findTemplateAndValidate(externalSchemas, externalDatas);
		
		base.file.validated.should.equal(true);	
	})		
	
	it('should error when referenced json component not present', function() {
	
		var externalSchemas = {
			'/SimpleAddress': schema.address
		}
	
		var externalDatas = {}	
	
		base.recordErrorResult();
		base.mockFilesAndSchema(data.baseRefAddress, data.baseRefAddress);
		
		base.findTemplateAndValidate(externalSchemas, externalDatas);
		
		base.file.validated.should.equal(false);			
		base.error.message.should.equal('Json component reference not found in '+ base.file.path +' : /SimpleAddress');	
	})	
	
	it('should resolve and validate sub component json successfully', function() {
	
		var externalSchemas = {
			'/SimpleAddress': schema.addressRefSub,
			'/SubItem':  schema.sub
		}
	
		var externalDatas = {
			'/SimpleAddress': data.addressRefSub, 
			'/SubItem': data.sub
		}	
	
		base.mockFilesAndSchema(data.addressRefSub, schema.addressRefSub);
		base.createThroughMock();
		
		base.findTemplateAndValidate(externalSchemas, externalDatas);
		
		base.file.validated.should.equal(true);   	
        base.file.data.sub.child.should.equal(data.sub.child, JSON.stringify(base.file.data.sub));	
    })	
	
	it('should resolve and validate sub component as property of sub json successfully', function() {
		
			var externalSchemas = {
				'/SimpleAddress': schema.addressRefSubSub,
				'/SubItem':  schema.sub
			}
		
			var externalDatas = {
				'/SimpleAddress': data.addressRefSubSub, 
				'/SubItem': data.sub
			}	
		
			base.mockFilesAndSchema(data.addressRefSubSub, schema.addressRefSubSub);
			base.createThroughMock();
			
			base.findTemplateAndValidate(externalSchemas, externalDatas);
			
			base.file.validated.should.equal(true);  	
			base.file.data.sub.sub.should.equal(data.sub, JSON.stringify(base.file.data.sub.sub));	
		})	

	it('should error when sub json component not present', function() {
	
		var externalSchemas = {
			'/SimpleAddress': schema.addressRefSub,
			'/SubItem':  schema.sub
		}
	
		var externalDatas = {
			'/SimpleAddress': data.addressRefSub
		}	
	
		base.recordErrorResult();
		base.mockFilesAndSchema(data.baseRefAddress, schema.baseRefAddress);
		
		base.findTemplateAndValidate(externalSchemas, externalDatas);
		
		base.file.validated.should.equal(false);
		base.error.message.should.equal('Json component reference not found in '+ base.file.path +'/SimpleAddress : /SubItem');		
	})	
	
	it('should resolve and validate component json component as part of property successfully', function() {	
	
		var externalSchemas = {
			'/SubItem': schema.sub
		}
	
		var externalDatas = {
			'/SubItem': data.sub 
		}	
	
		base.mockFilesAndSchema(data.variableArrayRefSub, schema.variableArrayRefSub);
		
		base.findTemplateAndValidate(externalSchemas, externalDatas);
		
		base.file.validated.should.equal(true);

        base.file.data.array[0].sub.should.equal(data.sub, JSON.stringify(base.file.data.array[0].sub));
	})	
	
	it('should resolve and validate component array of json components successfully', function() {	
	
		var externalSchemas = {
			'/SubItem': schema.sub
		}
	
		var externalDatas = {
			'/SubItem': data.sub 
		}	
	
		base.mockFilesAndSchema(data.arrayRefSub, schema.subArrayRefSub);
		
		base.findTemplateAndValidate(externalSchemas, externalDatas);
		
		base.file.validated.should.equal(true);	
        base.file.data[0].sub.should.equal(data.sub, JSON.stringify(base.file.data[0].sub));
	})
	
	it('should resolve and validate component property array of json components successfully', function() {	
	
		var externalSchemas = {
			'/SubItem': schema.sub
		}
	
		var externalDatas = {
			'/SubItem': data.sub 
		}	
	
		base.mockFilesAndSchema(data.variableSubArrayRefSub, schema.variableSubArrayRefSub);

		base.findTemplateAndValidate(externalSchemas, externalDatas);
		
		base.file.validated.should.equal(true);	
        base.file.data.array[0].should.equal(data.sub, JSON.stringify(base.file.data.array[0]));
	})

});	
