'use strict';

const _ = require('lodash');
const config = require('../config');
const storage = require('./storage');

function shouldBlock(ip) {
  const blockedIps = (config.get('site.blockedIps') || '').split(',');
  const whitelistedIps = (config.get('site.whitelistedIps') || '').split(',');
  const throttleLimit = config.get('site.thresholdBlock');
  const throttleLimitParsed = parseInt(throttleLimit, 10);

  // If the IP is whitelisted via config then let them through immediately
  if (whitelistedIps.indexOf(ip) > -1) {
    return false;
  }

  // If the IP is blocked via config then block straight away
  if (blockedIps.indexOf(ip) > -1) {
    return true;
  }

  // Invalid throttle limit - don't throttle by default
  if (throttleLimit != throttleLimitParsed || throttleLimitParsed === 0) {
    return false;
  }

  const requestsFromIpList = _.find(storage.getSummaryByCriteria('ip'), {key: ip});
  const requestsFromIpCount = _.get(requestsFromIpList, 'count', 0);

  // throttle has been surpassed - block for the remaining sampling frame
  if (requestsFromIpCount > throttleLimit) {
    // console.log('More requests than allowed from ip:', ip);
    // console.log('requestsFromIp', requestsFromIpCount);
    return true;
  }

  return false;
}

/*
 * Sends a response to the browser immediately with 429 Code and a brief message
 */
function blockRequest(data, res) {
  const monitoringFrameSeconds = config.get('site.samplingFrameSeconds');
  const supportEmail = config.get('site.supportEmail');

  let logMsg = '> Blocking a request: ';
  logMsg += `${data.ip} | ${data.url} | ${data.sessionId} | ${data.userAgent}\n\n`;

  storage.bumpSystemStat('blocked');
  console.log(logMsg);

  const minutes = Math.round(monitoringFrameSeconds / 60);

  const output = [];
  output.push('Error 429: Too Many Requests.');
  output.push(`Try again in ${minutes} minutes.`);
  output.push(`If you think you shouldn't be seeing this message please contact support at ${supportEmail}.`);

  return res.status(429).send(output.join('\n'));
}

module.exports = {
  shouldBlock,
  blockRequest
};
