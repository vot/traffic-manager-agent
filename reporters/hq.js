'use strict';

const request = require('request');

const storage = require('../lib/storage');
const config = require('../config');


function reportFrame() {
  // get frame
  // pack it in a request
  // send
  const allRequests = storage.getAll();
  const systemStats = storage.getSystemStats();

  const siteId = config.get('reporters.hq.siteId');
  const siteSecret = config.get('reporters.hq.siteSecret');
  const instanceId = config.get('instance.id');
  const hqUrl = config.get('reporters.hq.url');

  const frame = {
    siteSecret: siteSecret,
    instanceId: instanceId,
    samples: allRequests,
    system: systemStats
  };

  const url = `${hqUrl}/api/v1/site/${siteId}/submitSamples`;

  // console.log('Sending frame to', url, frame);

  const requestOpts = {
    method: 'POST',
    uri: url,
    json: frame
  };

  request(requestOpts, function (error, response, body) {
    if (error) {
      // console.log(error);
      return;
    }

    if (!response || response.statusCode !== 200 || body.success !== true) {
      // console.log(body);
      return;
    }

    console.log('Successfully uploaded frame to Traffic Manager HQ');
  });

}

module.exports = {
  reportFrame
};
