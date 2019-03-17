'use strict';

// const _ = require('lodash');
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
    console.log('setting newFrameDuration', newFrameDuration);
    MONITORING_FRAME_SEC = newFrameDuration;
  }
}

function isFrameSummaryReady() {
  const now = Date.now();
  const exp = LAST_FRAME_TS_PRECISE + (MONITORING_FRAME_SEC * 1000);

  return now > exp;
}

function sendEventImmediately(req) {
  const reporterStdOut = config.get('reporters.StdOut');
  const reporterFile = config.get('reporters.File');

  if (reporterStdOut.enabled) {
    reporters.StdOut.reportSingleEvent(req, reporterStdOut.format);
  }

  if (reporterFile.enabled) {
    reporters.File.reportSingleEvent(req, reporterFile.format);
  }
}

function sendAggregatedFrameIfReady() {
  const reporterTrafficManagerHQ = config.get('reporters.TrafficManagerHQ');
  const now = Date.now();
  updateFrameMonitoringPeriod();

  const frameSummaryReady = isFrameSummaryReady();

  if (frameSummaryReady) {
    if (reporterTrafficManagerHQ.enabled) {
      console.log(`> Logging requests in the last ${MONITORING_FRAME_SEC} seconds`);
      reporters.TrafficManagerHQ.reportCurrentFrame();
    }
    // rotate frame after reporting on it
    storage.resetFrame();

    console.log('Frame has been reset');
    LAST_FRAME_TS_PRECISE = now;
  }
}

module.exports = {
  sendEventImmediately,
  sendAggregatedFrameIfReady,
};
