'use strict';

const _ = require('lodash');
const config = require('../config');

const reporters = require('../reporters/index');

let LAST_FRAME_TS_PRECISE = 0;
const MONITORING_FRAME_SEC = config.get('policies.samplingFrameSeconds');

function trigger() {
  // const confFrameDuration = config.get('policies.samplingFrameSeconds');
  // const newFrameDurationParsed = parseInt(confFrameDuration, 10);
  // const newFrameDuration = (confFrameDuration == newFrameDurationParsed) ? newFrameDurationParsed : 600;
  //
  // if (newFrameDuration !== MONITORING_FRAME_SEC) {
  //   console.log('setting newFrameDuration', newFrameDuration);
  //   MONITORING_FRAME_SEC = newFrameDuration;
  // }

  const now = Date.now();
  const exp = LAST_FRAME_TS_PRECISE + (MONITORING_FRAME_SEC * 1000);

  if (now > exp) {
    console.log(`> Logging requests in the last ${MONITORING_FRAME_SEC} seconds`);

    reporters.triggerReporters();

    LAST_FRAME_TS_PRECISE = now;
  }
}

module.exports = {
  trigger
};
