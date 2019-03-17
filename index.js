'use strict';

const requestIp = require('request-ip');

const config = require('./config');
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
  return Math.ceil(time);
}


function generateTrafficManagerAgentMiddleware(appConfig) {

  config.init(appConfig);

  function trafficManagerAgentMiddleware(req, res, next) {
    // start measuring time
    const startAt = process.hrtime();
    const startTimestamp = Number(Date.now().toString());
    const ip = requestIp.getClientIp(req);

    // override res.send function to register event just before sending response
    const originalFn = res.send;
    res.send = function (body) {
      // console.log('Capturing stats');
      const timeProcessing = timeSinceInMs(startAt);
      const responseSize = body.length;
      const statusCode = res.statusCode;


      const metadata = {
        timestamp: startTimestamp,
        timeProcessing,
        responseSize,
        statusCode
      };
      const sample = createSampleFromRequest(req, metadata);
      storage.add(sample);

      reporting.sendEventImmediately(sample);
      reporting.sendAggregatedFrameIfReady();

      // console.log(`Sending response to client in ${timeProcessing}ms.`);
      originalFn.apply(this, arguments);
    };

    // perform throttling
    const shouldBlock = throttling.shouldBlock(ip);

    if (shouldBlock) {
      const sampleData = createSampleFromRequest(req, {statusCode: 429});
      return throttling.blockRequest(sampleData, res);
    }

    next();
  }

  return trafficManagerAgentMiddleware;
}


module.exports = generateTrafficManagerAgentMiddleware;
