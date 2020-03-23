'use strict';

const frameFormatter = require('./_stdOutFrameSummary');

function reportCurrentFrame() {
  // parse reporterConfig arg here
  frameFormatter.logFrameSummaryToStdOut();
}

module.exports = { reportCurrentFrame };
