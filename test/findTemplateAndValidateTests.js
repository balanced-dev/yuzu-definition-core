var rewire = require('rewire'), 
should = require('should'), 
S = require('string'),
findTemplateAndValidate = rewire('../modules/findTemplateAndValidateFromJson');

var file = {};
var enc = "enc";
var cb = function() {}	

var dir = '';

var beforeEachFn = function() {
	file.isNull = function() { return false; }
	file.isStream = function() { return false; }	
	file.contents = new Buffer('{}');		
}

describe('findTemplateAndValidate error', function() {
	
	beforeEach(beforeEachFn);
	
	it('should error where file is a stream', function() {
	
		file.isStream = function() { return true; }

		var emit = function(name, error) {
			name.should.equal('error');
			error.message.should.equal('Streaming not supported');
			error.plugin.should.equal('Find template and validate error');
		}
		
		createThroughMock(emit);		
		
		findTemplateAndValidate();
	})		
	
	it('should error when the content file does not parse as json', function() {

		file.contents = new Buffer('{name: "test"}');
		file.path = 'c:/templates/parHeader/data/template_data.json';
	
		mockError('JSON Error for '+ file.path +', SyntaxError: Unexpected token n');	
		
		findTemplateAndValidate();
	})		
	
	it('should error when more than one handlebars file is found in parent directory', function() {
	
		file.path = 'c:/templates/parHeader/data/template_data.json';
		dir = 'c:\\templates\\parHeader';
	
		var readdirSync = function(dir) {
			if (dir == dir)
				return ['template.hbs', 'template2.hbs']
		}
	
		createFsMock(readdirSync);
		mockError('More than one Handlebars file found at '+ dir);
		
		findTemplateAndValidate();
	})		
	
	it('should error when more than one schema file is found in parent directory', function() {
	
		file.path = 'c:/templates/parHeader/data/template_data.json';
		dir = 'c:\\templates\\parHeader';
	
		var readdirSync = function(dir) {
			if (dir == dir)
				return ['data.schema', 'data2.schema']
		}
	
		createFsMock(readdirSync);
		mockError('More than one Json Schema file found at '+ dir);	
		
		findTemplateAndValidate();
	})			
	
	it('should error when the schema file is not present for the json', function() {
	
		file.path = 'c:/templates/parHeader/data/template_data.json';
		dir = 'c:\\templates\\parHeader';
	
		var readdirSync = function(dir) {
			if (dir == dir)
				return ['template.hbs']
		}
	
		var readFileSync = function(path, enc) {
			if(path == 'c:\\templates\\parHeader\\template.hbs')
				return '<h1>Template</h1>';				
		}		
	
		createFsMock(readdirSync, readFileSync);
		mockError('Schema file not found in the parent directory for c:\\templates\\parHeader');	
		
		findTemplateAndValidate();
	})		
});
	
describe('findTemplateAndValidate function', function() {	
	
	beforeEach(beforeEachFn);	
	
	it('should swap out the data content for the template content from the parent directory', function() {
		
		mockFilesAndSchema(dataBase, schemaBase);
		
		findTemplateAndValidate();
		
		file.contents.toString().should.equal('<h1>Template</h1>');
	})	
	
	it('should change extension to hbs so that handlebars renders', function() {
		
		mockFilesAndSchema(dataBase, schemaBase);
		
		findTemplateAndValidate();
		
		file.path.should.equal('c:/templates/parHeader/data/template_data.hbs')
	})		
	
	it('should add a default layout of layout', function() {
		
		mockFilesAndSchema(dataBase, schemaBase);
		
		findTemplateAndValidate();
		
		file.layout.should.equal('layout')
	})		
	
	it('should change layout file when in json file as an extension', function() {
		
		mockFilesAndSchema(dataBase, schemaBase, 'c:/templates/parHeader/data/template_data.layout2.json');
		
		findTemplateAndValidate();
		
		file.layout.should.equal('layout2');
	})	
	
	it('should change layout file when directory path contains dot', function() {
		
		mockFilesAndSchema(dataBase, schemaBase, 'c:/templates/parHeader/data.layout/template_data.layout2.json');
		
		findTemplateAndValidate();
		
		file.layout.should.equal('layout2');
	})			
});	
	
describe('findTemplateAndValidate schema', function() {	
	
	beforeEach(beforeEachFn);	
	
	it('should error when the schema file does not parse', function() {	
	
		mockFilesAndSchema(dataBase, schemaInvalid);	
	
		mockError('Cannot parse file : Json Schema in c:\\templates\\parHeader');		
		
		findTemplateAndValidate();
		
		file.validated.should.equal(false);	
	})		
	
	it('should validate using schema file', function() {
	
		mockFilesAndSchema(dataBase, schemaBase);	
		createThroughMock();
		
		findTemplateAndValidate();
		
		file.validated.should.equal(true);	
	})	
	
	it('should error using invalid schema file', function() {
	
		dataBase.another = 'test';
	
		mockFilesAndSchema(dataBase, schemaBase);	
		mockError('validation on '+ dir +' : additionalProperty "another" exists in instance when not allowed for /SimplePerson');		
		
		findTemplateAndValidate();
		
		file.validated.should.equal(false);	
	})				
	
	it('should validate and resolve schema file', function() {	

		var externalSchemas = {
			'/SimpleAddress': schemaAddress
		}
	
		mockFilesAndSchema(dataBaseAddress, schemaBaseRefAddress);
		createThroughMock();
		
		findTemplateAndValidate(externalSchemas);
		
		file.validated.should.equal(true);	
	})			

	it('should error using invalid resolved schema file', function() {
	
		dataBaseAddress.address.postcode = 'M1 2JW';	
	
		var externalSchemas = {
			'/SimpleAddress': schemaAddress
		}

		mockFilesAndSchema(dataBaseAddress, schemaBaseRefAddress);
		mockError('validation on '+ dir +' : additionalProperty "postcode" exists in instance when not allowed for /SimpleAddress');

		findTemplateAndValidate(externalSchemas);
		
		dataBaseAddress.address.postcode = undefined;
		
		file.validated.should.equal(false);		
	})				
	
	it('should validate using sub schema files', function() {

		var externalSchemas = {
			'/SimpleAddress': schemaAddressRefSub,
			'/SubItem':  schemaSub
		}
	
		var externalDatas = {	}	
	
		mockFilesAndSchema(dataBaseAddressSub, schemaBaseRefAddress);
		createThroughMock();
		
		findTemplateAndValidate(externalSchemas, externalDatas);
		
		file.validated.should.equal(true);	
	})		
	
	it('should error using invalid sub schema files', function() {
	
		dataBaseAddressSub.address.sub.another = "test";
	
		var externalSchemas = {
			'/SimpleAddress': schemaAddressRefSub,
			'/SubItem':  schemaSub
		}
	
		var externalDatas = {	}	
	
		mockFilesAndSchema(dataBaseAddressSub, schemaBaseRefAddress);
		mockError('validation on '+ dir +' : additionalProperty "another" exists in instance when not allowed for /SubItem');
		
		findTemplateAndValidate(externalSchemas, externalDatas);
		
		dataBaseAddressSub.address.sub.another = undefined;	
		
		file.validated.should.equal(false);	
	})		
});	
	
describe('findTemplateAndValidate component json', function() {	
	
	beforeEach(beforeEachFn);	
	
	it('should resolve and validate component json successfully', function() {	
	
		var externalSchemas = {
			'/SimpleAddress': schemaAddress
		}
	
		var externalDatas = {
			'/SimpleAddress': dataAddress 
		}	
	
		mockFilesAndSchema(dataBaseRefAddress, schemaBaseRefAddress);
		createThroughMock();
		
		findTemplateAndValidate(externalSchemas, externalDatas);
		
		file.validated.should.equal(true);	
	})		
	
	it('should error when referenced json component not present', function() {
	
		var externalSchemas = {
			'/SimpleAddress': schemaAddress
		}
	
		var externalDatas = {}	
	
		mockFilesAndSchema(dataBaseRefAddress, schemaBaseRefAddress);
		mockError('Json component reference not found in '+ file.path +' : /SimpleAddress');
		
		findTemplateAndValidate(externalSchemas, externalDatas);
		
		file.validated.should.equal(false);			
	})	
	
	it('should resolve and validate sub component json successfully', function() {
	
		var externalSchemas = {
			'/SimpleAddress': schemaAddressRefSub,
			'/SubItem':  schemaSub
		}
	
		var externalDatas = {
			'/SimpleAddress': dataAddressRefSub, 
			'/SubItem': dataSub
		}	
	
		mockFilesAndSchema(dataBaseAddressSub, schemaBaseRefAddress);
		createThroughMock();
		
		findTemplateAndValidate(externalSchemas, externalDatas);
		
		file.validated.should.equal(true);	
	})	
	
	it('should error when sub json component not present', function() {
	
		var externalSchemas = {
			'/SimpleAddress': schemaAddressRefSub,
			'/SubItem':  schemaSub
		}
	
		var externalDatas = {
			'/SimpleAddress': dataAddressRefSub
		}	
	
		mockFilesAndSchema(dataBaseRefAddress, schemaBaseRefAddress);
		mockError('Json component reference not found in '+ file.path +'/SimpleAddress : /SubItem');
		
		findTemplateAndValidate(externalSchemas, externalDatas);
		
		file.validated.should.equal(false);	
	})	
	
	it('should resolve and validate component json component as part of property successfully', function() {	
	
		var externalSchemas = {
			'/SubItem': schemaSub
		}
	
		var externalDatas = {
			'/SubItem': dataSub 
		}	
	
		mockFilesAndSchema(dataVariableArrayRefSub, schemaVariableArrayRefSub);
		
		findTemplateAndValidate(externalSchemas, externalDatas);
		
		file.validated.should.equal(true);	
	})	
	
	it('should resolve and validate component array of json components successfully', function() {	
	
		var externalSchemas = {
			'/SubItem': schemaSub
		}
	
		var externalDatas = {
			'/SubItem': dataSub 
		}	
	
		mockFilesAndSchema(dataArrayRefSub, subArrayRefSub);
		
		findTemplateAndValidate(externalSchemas, externalDatas);
		
		file.validated.should.equal(true);	
	})
	
	it('should resolve and validate component property array of json components successfully', function() {	
	
		var externalSchemas = {
			'/SubItem': schemaSub
		}
	
		var externalDatas = {
			'/SubItem': dataSub 
		}	
	
		mockFilesAndSchema(dataVariableSubArrayRefSub, schemaVariableSubArrayRefSub);

		findTemplateAndValidate(externalSchemas, externalDatas);
		
		file.validated.should.equal(true);	
	})					
});			
	
function mockFilesAndSchema(dataFile, schema, path)
{
	if(!path)
		file.path = 'c:/templates/parHeader/data/template_data.json';
	else
		file.path = path;
		
	file.contents = new Buffer(JSON.stringify(dataFile));
	dir = 'c:\\templates\\parHeader';

	var readdirSync = function(dir) {
		if (dir == dir)
			return ['data.schema', 'template.hbs']
	}

	var readFileSync = function(path, enc) {
        if(fixDirSeps(path) == 'c:-templates-parHeader-data.schema')
			return JSON.stringify(schema);
        if(fixDirSeps(path) == 'c:-templates-parHeader-template.hbs')
			return '<h1>Template</h1>';				
	}			

	createFsMock(readdirSync, readFileSync);
}

function mockError(errorMessage)
{
	var emit = function(name, error) {
		name.should.equal('error');
        fixDirSeps(error.message).should.equal(fixDirSeps(errorMessage));
		error.plugin.should.equal('Find template and validate error');
	}		

	createThroughMock(emit);
}

function fixDirSeps(str)
{    
    str = str.replace(/\//g, '-');
    str = str.replace(/\\/g, '-');
    return str
}

var createFsMock = function(readdirSync, readFileSync)
{
	findTemplateAndValidate.__set__(
		{ fs:
			{ 
				readdirSync: readdirSync,
				readFileSync: readFileSync,
			}
		}
	);
}

var createThroughMock = function(emit)
{
	findTemplateAndValidate.__set__(
		{ through:
			{ 
				obj: function (obj) {
					obj.call(this, file, enc, cb)
				},
				push: function(obj)
				{ file = obj; },
				emit: emit
			}
		}
	);
}	


var dataBase = {
	"name": "Test",
};	

var schemaBase = {
	"id": "/SimplePerson",
	"type": "object",
	"properties": {
		"name": {"type": "string"}
	},
	"additionalProperties": false	
};	

var schemaInvalid = '{ "id": "/SimplePerson", "type":"object "properties": {"name": {"type": "string"}}, "additionalProperties": false}';	

var dataBaseAddress = {
	"name": "Test",
	"address": {
		"lines": [ "1600 Pennsylvania Avenue Northwest" ],
		"zip": "DC 20500",
		"city": "Washington",
		"country": "USA"
	}
};	

var schemaBaseRefAddress = {
	"id": "/SimplePerson",
	"type": "object",
	"properties": {
		"name": {"type": "string"},
		"address": { "$ref": "/SimpleAddress" }
	},
	"additionalProperties": false	
};	

var dataBaseAddressSub = {
	"name": "Test",
	"address": {
		"lines": [ "1600 Pennsylvania Avenue Northwest" ],
		"zip": "DC 20500",
		"city": "Washington",
		"country": "USA",
		"sub": {
			"child": "another sub item",
		}
	}
};

var dataBaseRefAddress = {
	"name": "Test",
	"address": { "$ref": "/SimpleAddress" }
};	

var dataAddress = {
	"lines": [ "1600 Pennsylvania Avenue Northwest" ],
	"zip": "DC 20500",
	"city": "Washington",
	"country": "USA"
}	

var schemaAddress = {
	"id": "/SimpleAddress",
	"type": "object",
	"properties": {
		"lines": {
			"type": "array",
			"items": {"type": "string"}
		},
		"zip": {"type": "string"},
		"city": {"type": "string"},
		"country": {"type": "string"}												
	},
	"additionalProperties": false	
}

var dataAddressRefSub = {
	"lines": [ "1600 Pennsylvania Avenue Northwest" ],
	"zip": "DC 20500",
	"city": "Washington",
	"country": "USA",
	"sub": { "$ref": "/SubItem" }
}	

var schemaAddressRefSub = {
	"id": "/SimpleAddress",
	"type": "object",
	"properties": {
		"lines": {
			"type": "array",
			"items": {"type": "string"}
		},
		"zip": {"type": "string"},
		"city": {"type": "string"},
		"country": {"type": "string"},	
		"sub": { "$ref": "/SubItem" }											
	},
	"additionalProperties": false	
}

var dataSub = {
	"child": "another sub item",
}	

var schemaSub = {
	"id": "/SubItem",
	"type": "object",
	"properties": {
		"child": {"type": "string"},											
	},
	"additionalProperties": false	
}	

var dataVariableArrayRefSub ={
	"array": [{
		"name": "Test",
		"sub": { "$ref": "/SubItem" }
	},{
		"name": "Test 2",
		"sub": { "$ref": "/SubItem" }
	}]
} 	

var schemaVariableArrayRefSub = {
	"id": "/Array",
	"type": "object",
	"properties": {
		"array": {
			"type": "array",
			"items": {
				"name": {"type": "string"},
				"sub": { "$ref": "/SubItem" }
			}
		}										
	},										
	"additionalProperties": false	
}

var dataArrayRefSub = [{
    "name": "Test",
    "sub": { "$ref": "/SubItem" }
},{
    "name": "Test 2",
    "sub": { "$ref": "/SubItem" }
}]    

var subArrayRefSub = {
    "id": "/Array",
    "type": "array",
    "items": {
        "child": {"type": "string"},
        "sub": { "$ref": "/SubItem" }
    },                                            
    "additionalProperties": false    
}

var dataVariableSubArrayRefSub = {
	"array" : [
		{"$ref": "/SubItem"},
		{"$ref": "/SubItem"},
	],
} 

var schemaVariableSubArrayRefSub = {
	"id": "/Array",
	"type": "object",
	"properties": {
		"array": {
			"type": "array",
			"items": { "$ref": "/SubItem" }
		}										
	},										
	"additionalProperties": false	
}	
