'use strict';

// const _ = require('lodash');
const fs = require('fs');

const eventFormatters = {
  apachecommon: require('../formatters/msg.apachecommon'),
  json: require('../formatters/msg.json'),
};

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
