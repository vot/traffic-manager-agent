'use strict';

const requestIp = require('request-ip');

const storage = require('./lib/storage');
const reporting = require('./lib/reporting');
const throttling = require('./lib/throttling');

const createSampleFromRequest = require('./lib/createSampleFromRequest');

/**
 * Calculates ms difference from two process.hrtime points (high resolution time)
 */
function timeSinceInMs(startTime) {
  const diff = process.hrtime(startTime);
  const time = diff[0] * 1e3 + diff[1] * 1e-6;
  return time;
}


function trafficManagerAgentMiddleware(req, res, next) {
  // start measuring time
  const startAt = process.hrtime();
  const startTimestamp = Date.now().toString();
  const ip = requestIp.getClientIp(req);

  // override res.send function to register event just before sending response
  const originalFn = res.send;
  res.send = function () {
    // console.log('Capturing stats');
    const requestTimeTaken = timeSinceInMs(startAt);
    const metadata = {timeProcessing: requestTimeTaken, timestamp: startTimestamp};
    const sample = createSampleFromRequest(req, metadata);
    storage.add(sample);
    reporting.trigger();

    console.log('Sending response');
    originalFn.apply(this, arguments);
  };

  // perform throttling
  const shouldBlock = throttling.shouldBlock(ip);

  if (shouldBlock) {
    const sampleData = createSampleFromRequest(req);
    return throttling.blockRequest(sampleData, res);
  }

  next();
}


module.exports = trafficManagerAgentMiddleware;
