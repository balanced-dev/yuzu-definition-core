'use strict';

var assert = require('assert');
var fs = require('fs');
var File = require('vinyl');

var sassJson = require('../../modules/hifi-gulp-sass-json.js');

var expectedBreakpointsJson = {
    "Body Fonts": {
        "b1": {
            "$largeWidth": "17px/26px $ffa",
            "$maxWidth": "20px/34px $ffa",
            "$midWidth": "17px/26px $ffa",
            "$minWidth": "15px/23px $ffa"
        },
        "b2": {
            "$largeWidth": "700 17px/26px $ffa",
            "$maxWidth": "700 20px/34px $ffa",
            "$midWidth": "700 17px/26px $ffa",
            "$minWidth": "700 15px/23px $ffa"
        },
        "b3": {
            "$largeWidth": "17px/25px $ffa",
            "$maxWidth": "18px/25px $ffa",
            "$midWidth": "16px/23px $ffa",
            "$minWidth": "15px/19px $ffa"
        },
        "b4": {
            "$largeWidth": "15px/22px $ffa",
            "$midWidth": "15px/22px $ffa",
            "$minWidth": "13px/17px $ffa"
        },
    },
    "Fonts": {
        "ffa": "'madras', sans-serif",
        "ffb": "'Lusitana', serif"
    },
    "Other Fonts": {
        "newsFont": {
            "$largeWidth": "17px/25px $ffa",
            "$maxWidth": "20px/34px $ffa",
            "$midWidth": "16px/24px $ffa",
            "$minWidth": "15px/23px $ffa"
        },
    },
    "Titles": {
        "t1": {
            "$largeWidth": "85px / 100px $ffa",
            "$maxWidth": "90px / 100px $ffa",
            "$midWidth": "75px / 85px $ffa",
            "$minWidth": "45px / 50px $ffa"
        },
        "t2": {
            "$largeWidth": "55px / 95px $ffa",
            "$maxWidth": "65px / 95px $ffa",
            "$midWidth": "70px / 90px $ffa",
            "$minWidth": "45px / 50px $ffa"
        },
        "t3": {
            "$largeWidth": "60px / 65px $ffa",
            "$maxWidth": "80px / 90px $ffa",
            "$midWidth": "55px / 65px $ffa",
            "$minWidth": "37px / 43px $ffa"
        },
        "t4": {
            "$largeWidth": "42px / 62px $ffa",
            "$maxWidth": "52px / 62px $ffa",
            "$midWidth": "40px / 50px $ffa",
            "$minWidth": "25px / 30px $ffa"
        },
        "t5": {
            "$largeWidth": "40px / 55px $ffa",
            "$maxWidth": "45px / 55px $ffa",
            "$midWidth": "35px / 45px $ffa",
            "$minWidth": "25px / 30px $ffa"
        },
        "t6": {
            "$largeWidth": "32px / 42px $ffa",
            "$maxWidth": "32px / 42px $ffa",
            "$midWidth": "32px / 42px $ffa",
            "$minWidth": "20px / 25px $ffa"
        },
        "t7": {
            "$largeWidth": "23px / 34px $ffa",
            "$maxWidth": "24px / 34px $ffa",
            "$midWidth": "23px / 34px $ffa",
            "$minWidth": "18px / 23px $ffa"
        },
        "t8": {
            "$largeWidth": "18px / 25px $ffa",
            "$maxWidth": "18px / 25px $ffa",
            "$midWidth": "18px / 25px $ffa",
            "$minWidth": "16px / 21px $ffa"
        }
    }
};

var expectedColoursJson = {  
    "white":           "#ffffff",
    "black": 	      "#000000",
    "concrete":        "#F3F3EE",
    "mercury":         "#E1E1E1",
    "mineShaft":       "#3b3b3b",
    "mirage":          "#1c2532",
    "angaroa":         "#031B44",
    "brightTurquoise": "#10d8c9",
    "cobalt":          "#0049ae",
    "japaneseLaurel":  "#008D00",
    "keyLimePie":      "#C3D029",
    "hippieBlue":      "#6299AF",
    "mangoTango":      "#EE7700",
    "flushOrange":     "#FF7300",
    "robinsEggBlue":   "#00D9CA",
    "c1": "$cobalt",
    "c2": "$brightTurquoise",
    "bg1": "$mirage",
    "bg2": "$concrete",
    "bg3": "$angaroa"
}

var getFile = function (fileName) {
    return new File({
        path: 'test/hifi-gulp-sass-json/data/' + fileName + '.scss',
        cwd: 'test/hifi-gulp-sass-json/',
        base: 'test/hifi-gulp-sass-json/data',
        contents: fs.readFileSync('test/hifi-gulp-sass-json/data/' + fileName + '.scss')
    });
};

describe('gulp-sass-json', function () {
    var output;

    beforeEach(function () {
        output = sassJson();
    });

    afterEach(function () {
        output.end();
    });

    it('Should parse basic file content to json', function (done) {
        var fakeFile = getFile('_colours');
        // events should be bind before .write() function is called
        output.on('data', function (file) {
            var json = JSON.parse(file.contents.toString('utf8'));
            assert.deepEqual(json, expectedColoursJson);
            done();
        });

        output.write(fakeFile);
    });

    it('Should parse complex file (sections, maps and comments) content to json ', function (done) {
        var fakeFile = getFile('_breakpoints');
        // events should be bind before .write() function is called
        output.on('data', function (file) {
            var json = JSON.parse(file.contents.toString('utf8'));
            assert.deepEqual(json, expectedBreakpointsJson);
            done();
        });

        output.write(fakeFile);
    });

});
