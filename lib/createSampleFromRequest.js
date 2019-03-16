'use strict';

const requestIp = require('request-ip');

/**
 * Transforms req object into Traffic Manager sample object.
 * Sample structure:
 *   {ip, userAgent, url, sessionId, status, responseSize, timeProcessing, timestamp}
 *
 * @param {object} req Full http req object
 * @return {object} Traffic Manager sample object
 */
function createSampleFromRequest(req, metadata) {
  const url = req.originalUrl || req.url;
  const sessionId = req.session.id;
  const ip = requestIp.getClientIp(req);
  const userAgent = req.headers['user-agent'];
  const statusCode = metadata.statusCode;
  const responseSize = metadata.responseSize;
  const timeProcessing = (metadata && metadata.timeProcessing) ? metadata.timeProcessing : false;
  const timestamp = (metadata && metadata.timestamp) ? metadata.timestamp : false;

  const rtn = {
    ip: ip,
    userAgent: userAgent,
    url: url
  };

  if (sessionId) {
    rtn.sessionId = sessionId;
  }

  if (statusCode) {
    rtn.statusCode = statusCode;
  }

  if (responseSize) {
    rtn.responseSize = responseSize;
  }

  if (timeProcessing) {
    rtn.timeProcessing = timeProcessing;
  }

  if (timestamp) {
    rtn.timestamp = timestamp;
  }

  return rtn;
}

module.exports = createSampleFromRequest;
