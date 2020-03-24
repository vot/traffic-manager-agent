'use strict';

const _ = require('lodash');
const fs = require('fs');
const formatEvent = require('../../util/formatEvent');

const defaultEventFormatter = 'apache';

function reportSingleEvent(ev, repConfig) {
  const filterQuery = _.get(repConfig, 'filter');
  const eventConformsToFilter = _.matches(filterQuery)(ev);

  if (!eventConformsToFilter) {
    return;
  }

  const formatFn = formatEvent[repConfig.format] || formatEvent[defaultEventFormatter];
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
