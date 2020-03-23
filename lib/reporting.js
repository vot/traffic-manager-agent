'use strict';

const _ = require('lodash');
const config = require('../config');

const reporters = require('./reporters');
const storage = require('./storage');

let LAST_FRAME_TS_PRECISE = Date.now();
let MONITORING_FRAME_SEC = config.get('settings.frameDurationSeconds');

function updateFrameMonitoringPeriod() {
  const confFrameDuration = config.get('settings.frameDurationSeconds');
  const newFrameDurationParsed = parseInt(confFrameDuration, 10);
  if (confFrameDuration != newFrameDurationParsed) {
    throw new Error(`Numeric value expected in "settings.frameDurationSeconds". Value provided: "${confFrameDuration}".`);
  }

  if (newFrameDurationParsed !== MONITORING_FRAME_SEC) {
    // console.log('Setting newFrameDuration', newFrameDuration);
    MONITORING_FRAME_SEC = newFrameDurationParsed;
  }
}

function isFrameFinished() {
  const now = Date.now();
  const exp = LAST_FRAME_TS_PRECISE + (MONITORING_FRAME_SEC * 1000);

  return now > exp;
}

function sendEventImmediately(req) {
  const configuredReporters = config.get('reporters', []);
  const immediateReporters = _.filter(configuredReporters, { type: 'event' });

  _.each(immediateReporters, (repConfig) => {
    if (repConfig) {
      const reporter = _.get(reporters, `event.${repConfig.output}`);
      reporter.reportSingleEvent(req, repConfig);
    }
  });
}

function sendAggregatedFrameIfReady() {
  const configuredReporters = config.get('reporters', []);
  const frameReporters = _.filter(configuredReporters, { type: 'frame' });

  updateFrameMonitoringPeriod();
  const now = Date.now();
  const frameFinished = isFrameFinished();

  if (frameFinished) {
    console.log(`Rotating monitoring frame (${MONITORING_FRAME_SEC} seconds)`);

    _.each(frameReporters, (repConfig) => {
      if (repConfig) {
        const reporter = _.get(reporters, `frame.${repConfig.output}`);
        reporter.reportCurrentFrame(repConfig);
      }
    });

    storage.resetFrame();
    LAST_FRAME_TS_PRECISE = now;
  }
}

module.exports = {
  sendEventImmediately,
  sendAggregatedFrameIfReady,
};
