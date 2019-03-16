'use strict';

const _ = require('lodash');

const HARD_LIMIT = 25;
let memstore;
let systemStats;

/**
 * Increases a counter of a specified key in system stats
 * @param {string} key
 */
function bumpSystemStat(key) {
  systemStats[key] += 1;
}

/**
 * Retrieves all system stats
 */
function getSystemStats() {
  return systemStats;
}

/**
 * Adds the request log entry to data storage
 *
 * @param {object} entry Object consisting at least of ip, userAgent, url
 */
function add(entry) {
  memstore.push(entry);
  bumpSystemStat('total');
}

/**
 * Returns the full raw array of request log entries
 *
 * @return {Object[]}
 */
function getAll() {
  return memstore;
}

/**
 * Resets the data in storage
 */
function reset() {
  memstore = [];
  systemStats = {
    404: 0,
    blocked: 0,
    total: 0
  };
}

/**
 * Returns a summarised object, grouped by specified criterion.
 *
 * @param {string} criteria Name of property by which to aggregate stats (i.e. "ip" or "userAgent")
 * @param {number} opts.limit Limit of entries to display in summary (i.e. 10 to display top 10 in summary)
 * @param {number} opts.threshold Minimum requests in order to be considered log-worthy
 * TODO @param {string} opts.filter A filter function, i.e. (entry) => (return _.includes(entry.tags, 'security'))
 */
function getSummaryByCriteria(criteria, opts) {
  const grouped = _.groupBy(memstore, criteria);

  const flattened = _.map(grouped, function (val, key) {
    return {key: key, count: val.length};
  });

  const sorted = _.reverse(_.sortBy(flattened, 'count'));
  let rtn = sorted;

  if (opts && typeof opts.limit === 'number') {
    const actualLimit = opts.limit < HARD_LIMIT ? opts.limit : HARD_LIMIT;
    const keysToUse = _.slice(_.map(sorted, 'key'), 0, actualLimit);

    rtn = {};
    _.each(keysToUse, function (key) {
      rtn[key] = grouped[key];
    });
  }

  return rtn;
}

// initialise data structures
reset();

module.exports = {
  add,
  getAll,
  getSummaryByCriteria,
  reset,
  bumpSystemStat,
  getSystemStats
};
