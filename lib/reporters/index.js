'use strict';

/* eslint-disable global-require */
const reporters = {
  frame: {
    stdout: require('./frame/stdout'),
    tmhub: require('./frame/hub'),
  },
  event: {
    stdout: require('./event/stdout'),
    file: require('./event/file'),
  }
};
/* eslint-enable global-require */


module.exports = reporters;
