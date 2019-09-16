'use strict';

var Microdb = require('./Microdb');

var initializer = function(apikey, opts) {
  return Microdb.getInstance(apikey, opts);
};

// Public module interface is a function, which passes through to RestClient constructor
module.exports = initializer;