'use strict';

const _ = require('lodash');
const os = require('os');

let realConfig;

const defaultConfig = {
  instance: {
    id: os.hostname()
  },
  settings: {
    blacklistedIps: [],
    whitelistedIps: [],
    perThreadRateLimit: 0,
    frameDurationSeconds: 60
  },
  reporters: []
};

function init(appConfig) {
  realConfig = _.merge({}, defaultConfig, appConfig);
}
function get(prop) {
  return _.get(realConfig, prop, '');
}

function set(prop, val) {
  return _.set(realConfig, prop, val);
}

module.exports = {
  init,
  get,
  set
};
