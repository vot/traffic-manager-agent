'use strict';

/* eslint-disable global-require */
const reporters = {
  TrafficManagerHQ: require('./hq'),
  StdOut: require('./stdout'),
  File: require('./file')
};
/* eslint-enable global-require */


module.exports = reporters;
