'use strict';

const _ = require('lodash');
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

  console.log(rtn);
}

module.exports = {
  reportSingleEvent,
};
