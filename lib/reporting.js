'use strict';

const _ = require('lodash');
const config = require('../config');

const reporters = require('./reporters');
const storage = require('./storage');

let LAST_FRAME_TS_PRECISE = Date.now();
let MONITORING_FRAME_SEC = 60;

function updateFrameMonitoringPeriod() {
  const confFrameDuration = config.get('policies.samplingFrameSeconds');
  const newFrameDurationParsed = parseInt(confFrameDuration, 10);
  const newFrameDuration = (confFrameDuration == newFrameDurationParsed) ? newFrameDurationParsed : 60;

  if (newFrameDuration !== MONITORING_FRAME_SEC) {
    console.log('Setting newFrameDuration', newFrameDuration);
    MONITORING_FRAME_SEC = newFrameDuration;
  }
}

function isFrameSummaryReady() {
  const now = Date.now();
  const exp = LAST_FRAME_TS_PRECISE + (MONITORING_FRAME_SEC * 1000);

  return now > exp;
}

function sendEventImmediately(req) {
  const reporterTypeQuery = { type: 'immediate', enabled: true };
  const reportersStdOut = _.filter(config.get('reporters.StdOut', []), reporterTypeQuery);
  const reportersFile = _.filter(config.get('reporters.File', []), reporterTypeQuery);

  _.each(reportersStdOut, (rep) => {
    if (rep && rep.enabled) {
      reporters.StdOut.reportSingleEvent(req, rep.format);
    }
  });

  _.each(reportersFile, (rep) => {
    if (rep && rep.enabled) {
      reporters.File.reportSingleEvent(req, rep.format);
    }
  });
}

function sendAggregatedFrameIfReady() {
  const reportersStdOut = _.filter(config.get('reporters.StdOut', []), { type: 'frame', enabled: true });
  // const reportersFile = _.find(config.get('reporters.File', []), { type: 'frame', enabled: true });
  const reporterTrafficManagerHQ = config.get('reporters.TrafficManagerHQ');
  const now = Date.now();
  updateFrameMonitoringPeriod();

  const frameSummaryReady = isFrameSummaryReady();

  if (frameSummaryReady) {
    console.log(`> Logging last frame: ${MONITORING_FRAME_SEC} seconds`);
    if (reporterTrafficManagerHQ.enabled) {
      console.log('> Sending last frame data to Traffic Manager HQ');
      reporters.TrafficManagerHQ.reportCurrentFrame();
    }

    if (_.get(reportersStdOut, '0.enabled')) {
      console.log('> Sending last frame summary data to StdOut');
      reporters.StdOut.reportFrameSummary();
    }

    // rotate frame after reporting on it
    console.log('> Clearing last frame and starting a new one');
    storage.resetFrame();
    LAST_FRAME_TS_PRECISE = now;
  }
}

module.exports = {
  sendEventImmediately,
  sendAggregatedFrameIfReady,
};
