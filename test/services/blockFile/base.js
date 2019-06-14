var rewire = require('rewire'), 
blockFilesService = rewire('../../../modules/services/blockFilesService.js');

var file = {};
var error = {};
var enc = "enc";
var cb = function() {}	

var dir = '';

var output = {
    file:  file,
    error: error,
    svc: blockFilesService,
    createFsMock : function(readdirSync, readFileSync)
    {
        blockFilesService.__set__(
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