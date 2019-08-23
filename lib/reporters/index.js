'use strict';

/* eslint-disable global-require */
const reporters = {
  TMHub: require('./hub'),
  StdOut: require('./stdout'),
  File: require('./file')
};
/* eslint-enable global-require */


module.exports = reporters;
