'use strict';

const _ = require('lodash');
const os = require('os');

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
      hq: 'https://trafficmanager.example.com',
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
  return _.get(config, prop, '');
}

function set(prop, val) {
  return _.set(config, prop, val);
}

module.exports = {
  get,
  set
};
