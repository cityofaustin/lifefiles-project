'use strict';

var Microdb = require('./microdb');

var initializer = function(apikey, opts) {
  return Microdb.getInstance(apikey, opts);
};


module.exports = initializer;