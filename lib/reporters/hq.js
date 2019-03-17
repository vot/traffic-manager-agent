'use strict';

const request = require('request');

const storage = require('../storage');
const config = require('../../config');

function reportCurrentFrame() {
  console.log('> reportCurrentFrame');
  // get frame
  // pack it in a request
  // send
  const allRequests = storage.getAll();
  const systemStats = storage.getSystemStats();

  const reporterTrafficManagerHQ = config.get('reporters.TrafficManagerHQ');
  const siteId = reporterTrafficManagerHQ.siteId;
  const siteSecret = reporterTrafficManagerHQ.siteSecret;
  const instanceId = config.get('instance.id');
  const hqUrl = reporterTrafficManagerHQ.url;

  const frame = {
    siteSecret,
    instanceId,
    samples: allRequests,
    system: systemStats
  };

  const url = `${hqUrl}/api/v1/site/${siteId}/submitSamples`;

  console.log('Sending frame to', url, frame);

  const requestOpts = {
    method: 'POST',
    uri: url,
    json: frame
  };

  request(requestOpts, (error, response, body) => {
    if (error) {
      console.log(error);
      return;
    }

    if (!response || response.statusCode !== 200 || body.success !== true) {
      console.log(body);
      return;
    }

    console.log('Successfully uploaded frame to Traffic Manager HQ');
  });
}

module.exports = {
  reportCurrentFrame
};
