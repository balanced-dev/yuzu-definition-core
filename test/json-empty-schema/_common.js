var array = require('./array.js');
var boolean = require('./boolean.js');
var enumTests = require('./enum.js');
var meta = require('./meta.js');
var nullTests = require('./null.js');
var number = require('./number.js');
var objectTests = require('./object.js');
var ref = require('./ref.js');
var string = require('./string.js');
var test = require('./test.js');

describe('json schema empty', function () {

  array();
  boolean();
  enumTests();
  meta();
  nullTests();
  number();
  objectTests();
  ref();
  string();
  test();

});