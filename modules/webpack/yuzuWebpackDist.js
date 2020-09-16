const path = require("path");
let fs = require('fs');
let build = require('../build');

const dataPath = '/data/';
const pathsPath = '/paths/';
const schemaPath = '/schema/';
const templatesPath = '/src/'

module.exports = (dataFile, source, blockFiles, externals) => {

    if(dataFile.includes('\\pages\\'))
    {
        let data = build.resolveDataString(source, dataFile, externals);
        let filename = `/data/${path.basename(dataFile)}`
        fs.writeFileSync(filename, source)
    }

}