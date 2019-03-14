'use strict';

const requestIp = require('request-ip');

/**
 * Transforms req object into Traffic Manager sample object.
 * Sample structure:
 *   {ip, userAgent, url, sessionId, status, responseSize, timeTaken}
 *
 * @param {object} req Full http req object
 * @return {object} Traffic Manager sample object
 */
function createSampleFromRequest(req, metadata) {
  const url = req.url;
  const sessionId = req.session.id;
  const ip = requestIp.getClientIp(req);
  const userAgent = req.headers['user-agent'];
  const status = req.status;
  const responseSize = req.status;
  const timeTaken = (metadata && metadata.timeTaken) ? metadata.timeTaken : false;

  const rtn = {
    ip: ip,
    userAgent: userAgent,
    url: url
  };

  if (sessionId) {
    rtn.sessionId = sessionId;
  }

  if (status) {
    rtn.status = status;
  }

  if (responseSize) {
    rtn.responseSize = responseSize;
  }

  if (timeTaken) {
    rtn.timeTaken = timeTaken;
  }

  return rtn;
}

module.exports = createSampleFromRequest;
