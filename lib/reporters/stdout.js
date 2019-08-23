'use strict';

/* eslint-disable global-require */
const eventFormatters = {
  apache: require('../formatters/msg.apache'),
  json: require('../formatters/msg.json'),
};

const frameFormatters = {
  summary: require('../formatters/frame.summary')
};
/* eslint-enable global-require */

const defaultEventFormatter = 'apache';

function reportSingleEvent(ev, format) {
  const fn = eventFormatters[format] || eventFormatters[defaultEventFormatter];
  const rtn = fn.formatMessage(ev);
  console.log(rtn);
}

function reportCurrentFrame() {
  frameFormatters.summary.logFrameSummaryToStdOut();
}

module.exports = {
  reportSingleEvent,
  reportCurrentFrame
};
