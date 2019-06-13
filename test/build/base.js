var rewire = require('rewire'), 
should = require('should'), 
S = require('string'),
svc = rewire('../../modules/gulp-yuzu-def-render.js');

var file = {};
var error = {};
var enc = "enc";
var cb = function() {}	

var dir = '';

var output = {
    file:  file,
    error: error,
    svc: svc,    
    beforeEachFn: function() {
        file.isNull = function() { return false; }
        file.isStream = function() { return false; }	
        file.contents = new Buffer('{}');		
    },

    recordErrorResult: function()
    {
        var emit = function(name, error) {
            output.error = error;
        }		

        output.createThroughMock(emit);
    },

    createThroughMock : function(emit)
    {
        svc.__set__(
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
    },	

    createBuildMock: function(mockTemplateSettings, mockLayoutName)
    {
        svc.__set__(
            { 
                build:
                { 
                    register: function() {},
                    setup: function() {},
                    render: function() {}
                }
            }
        );
    }
}

module.exports = output;