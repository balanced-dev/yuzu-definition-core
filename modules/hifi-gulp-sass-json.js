var gulpmatch = require('gulp-match');
var through   = require('through');
var gutil     = require('gulp-util');

var wrapInObject = function(variablesObject, sectionArray, key, value) {
    if(sectionArray.length > 1) {
        if(variablesObject[sectionArray[0].trim()] == undefined) {
            variablesObject[sectionArray[0].trim()] = {};
        }
        variablesObject[sectionArray[0].trim()][key] = value;
    }
    else {
        variablesObject[key] = value;
    }
}

module.exports = function() {
    return through(function (file) {
        var inlineCommentRegex = /\/\/.*/g,
            variablesRegex = /\$(.*?):([\s\S]*?);/g,
            variables = {},
            stringifiedContent,
            jsonVariables,
            filename,
            regexResult;

        // if it does not have a .scss suffix, ignore the file
        if (!gulpmatch(file,'**/*.scss')) {
            this.push(file);
            return;
        }

        // load the JSON
        stringifiedContent = String(file.contents);

        //Strip out inline comments
        stringifiedContent = stringifiedContent.replace(inlineCommentRegex, "");

        // Split on start of multi-line comments
        var sections = stringifiedContent.split('/*');

        for(var i = 0, len = sections.length; i < len; i++) {
            // Split on end of mutli-line comment
            sections[i] = sections[i].split('*/');

            var variablesIndex = sections[i].length - 1; // If there was a section comment, there will be 2 elements in array, else just one

            while ((regexResult = variablesRegex.exec(sections[i][variablesIndex])) !== null) {
                if (regexResult.index === variablesRegex.lastIndex) {
                    variablesRegex.lastIndex++;
                }

                // test for sass maps
                if (regexResult[2].indexOf(':') > -1 &&
                    regexResult[2].indexOf('(') > -1 &&
                    regexResult[2].indexOf(')') > -1 &&
                    regexResult[2].indexOf(',') > -1) {

                        // Split up the SASS map property
                        var sassMapRule = regexResult[2].split(',');

                        // Empty object that will be the JSON property
                        var outputObj = {};

                        for (var prop in sassMapRule) {
                            var sassMapRuleObj = sassMapRule[prop].split(':');

                            // Ignore sass map property if it is null or undefined
                            if (!sassMapRuleObj[0] || !sassMapRuleObj[1]) {
                                continue;
                            }

                            // time newlines, whitespaces, and parentheses
                            var sassMapKey = sassMapRuleObj[0].replace(/[\(\n]/, '').trim(); 
                            var sassMapVal = sassMapRuleObj[1].replace(/[)]/, '').trim();

                            outputObj[sassMapKey] = sassMapVal;
                    }
                    wrapInObject(variables, sections[i], regexResult[1].trim(), outputObj);
                // non sass maps rules
                } else {
                    wrapInObject(variables, sections[i], regexResult[1].trim(), regexResult[2].trim());
                }
            }
        }
        jsonVariables = JSON.stringify(variables, null, '\t');
        file.contents = Buffer(jsonVariables);
        filename = file.path.split('/').pop();
        file.path = file.path.replace(filename, filename.replace(/^_/, ''));
        file.path = gutil.replaceExtension(file.path, '.json');
        this.push(file);
    });
};
