var rewire = require('rewire'), 
should = require('should'), 
S = require('string'),
templateHelper = rewire('../../modules/templateHelper/templateHelper.js');

var file = {};
var error = {};
var enc = "enc";
var cb = function() {}	

var dir = '';

var output = {
    file:  file,
    error: error,
    svc: templateHelper,
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

    fixDirSteps: function fixDirSeps(str)
    {    
        str = str.replace(/\//g, '-');
        str = str.replace(/\\/g, '-');
        return str
    },

    createFsMock : function(readdirSync, readFileSync)
    {
        templateHelper.__set__(
            { fs:
                { 
                    readdirSync: readdirSync,
                    readFileSync: readFileSync,
                }
            }
        );
    }	
}

module.exports = output;