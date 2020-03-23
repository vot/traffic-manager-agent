'use strict';

const request = require('request');

const storage = require('../../storage');
const config = require('../../../config');

// get frame
// pack it in a request
// send
function reportCurrentFrame(reporterConfig) {
  const allRequests = storage.getAll();
  const systemStats = storage.getSystemStats();
  const instanceId = config.get('instance.id');

  const siteId = reporterConfig.siteId;
  const siteSecret = reporterConfig.siteSecret;
  const hubUrl = reporterConfig.url;

  const frame = {
    siteSecret,
    instanceId,
    samples: allRequests,
    system: systemStats
  };

  const url = `${hubUrl}/api/v1/site/${siteId}/submitSamples`;

  const requestOpts = {
    method: 'POST',
    uri: url,
    json: frame
  };

  request(requestOpts, (error, response, body) => {
    if (error) {
      console.log('Error uploading frame to Traffic Manager Hub', error);
      return;
    }

    if (!response || response.statusCode !== 200 || body.success !== true) {
      console.log('Error uploading frame to Traffic Manager Hub', body);
      return;
    }

    console.log('Successfully uploaded frame to Traffic Manager Hub');
  });
}

module.exports = {
  reportCurrentFrame
};
