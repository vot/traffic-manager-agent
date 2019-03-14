'use strict';

const _ = require('lodash');

const defaultConfig = {
  machineId: 'prod-web-instance-23',
  site: {
    blockedIps: [],
    whitelistedIps: [],
    thresholdAlert: 50,
    thresholdBlock: 100,
    samplingFrameSeconds: 60,
    supportEmail: 'support@example.com'
  },
  reporters: {
    stdout: {
      enabled: true,
      level: 'alert'
    },
    apachelog: {
      enabled: true,
      path: './apache.log'
    },
    json: {
      enabled: true,
      path: './cyberpolice.log'
    },
    hq: {
      enabled: true,
      hq: 'https://hq.cyberpolice.io',
      appId: '',
      appKey: '',
    },
    slack: {
      enabled: true,
      level: 'block',
      hookUrl: ''
    }
  }
};

const config = defaultConfig;

function get(prop) {
  return _.get(config, prop);
}

function set(prop, val) {
  return _.set(config, prop, val);
}

module.exports = {
  get,
  set
};