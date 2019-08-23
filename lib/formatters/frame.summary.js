const _ = require('lodash');

const config = require('../../config');
const storage = require('../storage');

const SUMMARY_TOP_ENTRIES = 5;

function generateFrameSummaryTextMessage(ips, sessions) {
  const rtn = [];

  rtn.push(`-- Top ${SUMMARY_TOP_ENTRIES} IPs --`);

  _.each(ips, (val, key) => {
    const uniqueUAs = Object.keys(_.groupBy(val, 'userAgent'));
    const uniqueSessions = Object.keys(_.groupBy(val, 'sessionId'));
    const tagGroups = _.omit(_.groupBy(val, 'tag'), 'undefined');

    rtn.push(`[${val.length} requests] ${key} ${_.get(val, '0.country', '')}`);

    if (uniqueSessions.length) {
      rtn.push(`${uniqueSessions.length} Session IDs (First: ${uniqueSessions[0]})`);
    }

    if (uniqueUAs.length) {
      rtn.push('User Agents:');
      _.each(uniqueUAs, (entry) => {
        rtn.push(`- ${entry}`);
      });
    }

    if (Object.keys(tagGroups).length) {
      rtn.push('Request tags:');
      _.each(tagGroups, (entries, tag) => {
        rtn.push(`- [${entries.length}] ${tag}`);
      });
    }
    rtn.push('\n');
  });


  rtn.push(`-- Top ${SUMMARY_TOP_ENTRIES} Sessions --`);

  _.each(sessions, (val, key) => {
    const uniqueUAs = Object.keys(_.groupBy(val, 'userAgent'));
    const uniqueIps = Object.keys(_.groupBy(val, 'ip'));

    rtn.push(`[${val.length}] ${key}`);

    if (uniqueUAs.length > 1) {
      rtn.push('');
      rtn.push('User Agents:');
      _.each(uniqueUAs, (entry) => {
        rtn.push(`- ${entry}`);
      });
    }
    if (uniqueIps.length > 1) {
      rtn.push('');
      rtn.push('IPs:');
      _.each(uniqueIps, (entry) => {
        rtn.push(`- ${entry}`);
      });
    }
  });

  return rtn.join('\n');
}

function generateFrameSummaryData() {
  const sortedIPs = storage.getSummaryByCriteria('ip', { limit: SUMMARY_TOP_ENTRIES });
  const sortedSessions = storage.getSummaryByCriteria('sessionId', { limit: SUMMARY_TOP_ENTRIES });
  // const tagSummary = storage.getSummaryByCriteria('tag');
  const systemStats = storage.getSystemStats();

  const summaryMessage = generateFrameSummaryTextMessage(sortedIPs, sortedSessions, systemStats);

  const MONITORING_FRAME_SEC = config.get('policies.samplingFrameSeconds');
  const requestsPerMinute = Math.ceil(systemStats.total / (MONITORING_FRAME_SEC / 60));

  const frameSummaryData = {
    summaryMessage,
    sortedIPs,
    sortedSessions,
    // tagSummary,
    stats: systemStats,
    requestsPerMinute
  };

  return frameSummaryData;
}

function logFrameSummaryToStdOut() {
  const frame = generateFrameSummaryData();
  const blockedRequestsCounter = _.get(frame, 'stats.blocked');


  // request tagging done only in Traffic Manager Hub at the moment
  //
  // const tagSummaryString = _.compact(_.map(frame.tagSummary, (tag) => {
  //   if (!tag.key || tag.key === 'undefined') {
  //     return false;
  //   }
  //   return `- [${tag.count} requests] ${tag.key}`;
  // })).join('\n');

  console.log(`Blocked requests: ${blockedRequestsCounter}`);
  console.log(`Total requests: ${frame.stats.total} (${frame.requestsPerMinute}/min)`);
  console.log();
  // console.log('-- Top Request Types --');
  // console.log(tagSummaryString);
  // console.log();

  console.log(frame.summaryMessage);
}


module.exports = {
  // generateFrameSummaryData,
  logFrameSummaryToStdOut
};
