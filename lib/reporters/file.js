'use strict';

const fs = require('fs');

/* eslint-disable global-require */
const eventFormatters = {
  apachecommon: require('../formatters/msg.apachecommon'),
  json: require('../formatters/msg.json'),
};
/* eslint-enable global-require */

const defaultEventFormatter = 'apachecommon';

function reportSingleEvent(ev, format) {
  const fn = eventFormatters[format] || eventFormatters[defaultEventFormatter];
  const rtn = fn.formatMessage(ev);
  fs.appendFile('accesslog.txt', `${rtn}\n`, (err) => {
    if (err) {
      throw err;
    }
  });
}

module.exports = {
  // reportCurrentFrame,
  reportSingleEvent
};
