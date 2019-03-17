'use strict';

/* eslint-disable global-require */
const eventFormatters = {
  apachecommon: require('../formatters/msg.apachecommon'),
  json: require('../formatters/msg.json'),
};

const frameFormatters = {
  summary: require('../formatters/frame.summary')
};
/* eslint-enable global-require */

const defaultEventFormatter = 'apachecommon';

function reportSingleEvent(ev, format) {
  const fn = eventFormatters[format] || eventFormatters[defaultEventFormatter];
  const rtn = fn.formatMessage(ev);
  console.log(rtn);
}

function reportCurrentFrame() {
  const frameSummaryData = frameFormatters.summary.generateFrameSummaryData();
  frameFormatters.summary.logFrameSummaryToStdOut(frameSummaryData);
}

module.exports = {
  reportCurrentFrame,
  reportSingleEvent
};
