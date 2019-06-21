"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

// create smallest number that satisfies:
// it bigger than minimum and it is mulitple of multipleOf
var minmul = function minmul(minimum, multipleOf, exclusive) {

  // if we can return 0, we do that
  if (minimum < 0 || !exclusive && minimum <= 0) {
    return 0;
  }

  var min = exclusive ? minimum + 1 : minimum;
  var rest = min % multipleOf;

  if (rest === 0) {
    return min;
  }

  var sign = multipleOf / Math.abs(multipleOf);
  var quot = (min - rest) / multipleOf;

  return (quot + sign) * multipleOf;
};

// create smallest number that satisfies:
// it bigger than minimum and it is mulitple of multipleOf
var maxmul = function maxmul(maximum, multipleOf, exclusive) {
  // this is symmtric to minmul
  var res = -minmul(-maximum, multipleOf, exclusive);
  return res === -0 ? 0 : res;
};

var _integer = function _integer(schema) {
  // todo
  var multipleOf = schema.multipleOf;
  var minimum = schema.minimum;
  var maximum = schema.maximum;
  var exclusiveMinimum = schema.exclusiveMinimum;
  var exclusiveMaximum = schema.exclusiveMaximum;

  // check what is defined

  var mo = multipleOf !== undefined,
      mi = minimum !== undefined,
      ma = maximum !== undefined;

  if (mo && mi && ma || !mo && mi && ma) {
    // minimum and maximum
    if ((minimum < 0 || !exclusiveMinimum && minimum <= 0) && (maximum > 0 || !exclusiveMaximum && maximum >= 0)) {
      return 0;
    } else {
      return exclusiveMinimum ? minimum + 1 : minimum;
    }
  } else if (mo && !mi && ma) {
    // multipleOf and maximum
    return maxmul(maximum, multipleOf, exclusiveMaximum);
  } else if (mo && mi && !ma) {
    // multipleOf and minimum
    return minmul(minimum, multipleOf, exclusiveMinimum);
  } else if (mo && !mi && !ma) {
    // only multipleOf
    return 0;
  } else if (!mo && !mi && ma) {
    // only maximum
    if (exclusiveMaximum) {
      return maximum > 0 ? 0 : maximum - 1;
    } else {
      return maximum >= 0 ? 0 : maximum;
    }
  } else if (!mo && mi && !ma) {
    // only minimum
    if (exclusiveMinimum) {
      return minimum < 0 ? 0 : minimum + 1;
    } else {
      return minimum <= 0 ? 0 : minimum;
    }
  } else {
    // totally free choice
    return 0;
  }
};

exports.default = _integer;