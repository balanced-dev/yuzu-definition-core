"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

// merges the array of schema's
// into one usable schema
var merge = function merge(schemas) {
  return schemas.reduce(function (prev, next) {
    return Object.assign(prev, next);
  }, {});
};

exports.default = merge;