'use strict';

const _ = require('lodash');
const formatEvent = require('../../util/formatEvent');

const defaultEventFormatter = 'apache';

function reportSingleEvent(ev, repConfig) {
  const filterQuery = _.get(repConfig, 'filter');
  const eventConforms = _.matches(filterQuery)(ev);

  if (!eventConforms) {
    return;
  }

  const formatFn = formatEvent[repConfig.format] || formatEvent[defaultEventFormatter];
  const rtn = formatFn(ev);

  console.log(rtn);
}

module.exports = {
  reportSingleEvent,
};
