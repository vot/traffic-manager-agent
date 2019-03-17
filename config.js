'use strict';

const _ = require('lodash');
const os = require('os');

let realConfig;

const defaultConfig = {
  instance: {
    id: os.hostname()
  },
  policies: {
    blockedIps: [],
    whitelistedIps: [],
    thresholdAlert: 50,
    thresholdBlock: 100,
    samplingFrameSeconds: 60
  },
  reporters: {
    StdOut: {
      enabled: true,
      format: 'apachecommon'
    }
  }
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
