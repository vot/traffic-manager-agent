'use strict';

const fs = require('fs');

/* eslint-disable global-require */
const eventFormatters = {
  apache: require('../formatters/msg.apache'),
  json: require('../formatters/msg.json'),
};
/* eslint-enable global-require */

const defaultEventFormatter = 'apache ';

function reportSingleEvent(ev, format) {
  const fn = eventFormatters[format] || eventFormatters[defaultEventFormatter];
  const rtn = fn.formatMessage(ev);
  // TODO: REMOVE HARDCODED FILENAME!
  fs.appendFile('access_log', `${rtn}\n`, (err) => {
    if (err) {
      throw err;
    }
  });
}

module.exports = {
  reportSingleEvent
};
