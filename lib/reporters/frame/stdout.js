'use strict';

const _ = require('lodash');

const generateTrafficLoadAvgSummaryForFrame = require('../../util/generateTrafficLoadAvgSummaryForFrame');
const generateFrameLoadAvgSummaryMessage = require('../../util/generateFrameLoadAvgSummaryMessage');

function reportCurrentFrame(reporterConfig) {
  const frameLoadAvgData = generateTrafficLoadAvgSummaryForFrame(reporterConfig);
  const blockedRequestsCounter = _.get(frameLoadAvgData, 'systemStats.blocked');

  const format = _.get(reporterConfig, 'format', 'detailed');

  if (format === 'count-only') {
    if (blockedRequestsCounter) {
      console.log(`Blocked ${blockedRequestsCounter} requests in the last frame (${frameLoadAvgData.frameDurationSeconds} seconds).`);
    }
    return null;
  }

  if (format === 'detailed') {
    console.log(`Summary of last frame (${frameLoadAvgData.frameDurationSeconds} seconds)`);

    console.log(`Blocked requests: ${blockedRequestsCounter}`);
    console.log(`Total requests: ${frameLoadAvgData.systemStats.total} (${frameLoadAvgData.requestsPerMinute}/min)`);
    console.log();

    const summaryMessage = generateFrameLoadAvgSummaryMessage(frameLoadAvgData.sortedIPs, frameLoadAvgData.sortedSessions, frameLoadAvgData.systemStats, reporterConfig);
    console.log(summaryMessage);

    return null;
  }

  console.log('Unknown format for frame stdout reporter', format);
  return null;
}

module.exports = { reportCurrentFrame };
