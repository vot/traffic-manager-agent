'use strict';

const _ = require('lodash');
const config = require('../config');
const storage = require('./storage');

function shouldBlock(ip) {
  const blacklistedIps = config.get('settings.blacklistedIps') || [];
  const whitelistedIps = config.get('settings.whitelistedIps') || [];
  const threadThrottleLimit = config.get('settings.perThreadRateLimit');
  const threadThrottleLimitParsed = parseInt(threadThrottleLimit, 10);

  // If the IP is whitelisted via config then let them through immediately
  if (whitelistedIps.indexOf(ip) > -1) {
    return false;
  }

  // If the IP is blocked via config then block straight away
  if (blacklistedIps.indexOf(ip) > -1) {
    return true;
  }

  // Invalid throttle limit - don't throttle by default
  if (threadThrottleLimit != threadThrottleLimitParsed || threadThrottleLimitParsed === 0) {
    return false;
  }

  const threadRequestsFromIp = _.find(storage.getSummaryByCriteria('ip'), { key: ip });
  const threadRequestsFromIpCount = _.get(threadRequestsFromIp, 'count', 0);

  // throttle has been surpassed - block for the remaining sampling frame
  if (threadRequestsFromIpCount > threadThrottleLimit) {
    return true;
  }

  return false;
}

/*
 * Sends a response to the browser immediately with 429 Code and a brief message
 */
function blockRequest(data, res) {
  const monitoringFrameSeconds = config.get('settings.frameDurationSeconds');
  const customBlockedRequestMessage = config.get('settings.customBlockedRequestMessage');

  storage.bumpSystemStat('blocked');

  const minutes = Math.round(monitoringFrameSeconds / 60);

  const output = [];
  output.push('Error 429: Too Many Requests.');
  output.push(`Try again in ${minutes} minutes.`);
  if (typeof customBlockedRequestMessage === 'string') {
    output.push(customBlockedRequestMessage);
  }

  return res.status(429).send(output.join('\n'));
}

module.exports = {
  shouldBlock,
  blockRequest
};
