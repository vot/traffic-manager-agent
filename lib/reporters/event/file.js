'use strict';

const _ = require('lodash');
const fs = require('fs');
const eventFormatters = require('../../formatEvent');

const defaultEventFormatter = 'apache';

function reportSingleEvent(ev, repConfig) {
  const filterQuery = _.get(repConfig, 'filter');
  const eventConforms = _.matches(filterQuery)(ev);

  if (!eventConforms) {
    return;
  }

  const formatFn = eventFormatters[repConfig.format] || eventFormatters[defaultEventFormatter];
  const rtn = formatFn(ev);
  const fileLocation = repConfig.location || 'access_log';
  fs.appendFile(fileLocation, `${rtn}\n`, (err) => {
    if (err) {
      throw err;
    }
  });
}

module.exports = {
  reportSingleEvent
};
