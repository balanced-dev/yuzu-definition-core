var rewire = require('rewire'), 
should = require('should'), 
S = require('string'),
findTemplateAndValidate = rewire('../../modules/findTemplateAndValidateFromJson.js');

var file = {};
var error = {};
var enc = "enc";
var cb = function() {}	

var dir = '';

var output = {
    file:  file,
    error: error,
    findTemplateAndValidate: findTemplateAndValidate,    
    beforeEachFn: function() {
        file.isNull = function() { return false; }
        file.isStream = function() { return false; }	
        file.contents = new Buffer('{}');		
    },
    mockFilesAndSchema: function mockFilesAndSchema(dataFile, schema, path)
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
            if(output.fixDirSteps(path) == 'c:-templates-parHeader-data.schema')
                return JSON.stringify(schema);
            if(output.fixDirSteps(path) == 'c:-templates-parHeader-template.hbs')
                return '<h1>Template</h1>';				
        }			

        output.createFsMock(readdirSync, readFileSync);
    },

    recordErrorResult: function()
    {
        var emit = function(name, error) {
            output.error = error;
        }		

        output.createThroughMock(emit);
    },

    fixDirSteps: function fixDirSeps(str)
    {    
        str = str.replace(/\//g, '-');
        str = str.replace(/\\/g, '-');
        return str
    },

    createFsMock : function(readdirSync, readFileSync)
    {
        findTemplateAndValidate.__set__(
            { fs:
                { 
                    readdirSync: readdirSync,
                    readFileSync: readFileSync,
                }
            }
        );
    },

    createThroughMock : function(emit)
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
}

module.exports = output;