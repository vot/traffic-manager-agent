const _ = require('lodash');

const LOG_LIMIT = 5;

function generateFrameSummaryMessage(ips, sessions, systemStats) {
  const rtn = [];

  rtn.push(`-- Top ${LOG_LIMIT} IPs --`);

  _.each(ips, function (val, key) {
    const uniqueUAs = Object.keys(_.groupBy(val, 'userAgent'));
    const uniqueSessions = Object.keys(_.groupBy(val, 'sessionId'));
    const tagGroups = _.omit(_.groupBy(val, 'tag'), 'undefined');

    rtn.push(`[${val.length} requests] ${key} ${_.get(val, '0.country', '')}`);

    if (uniqueSessions.length) {
      rtn.push(`${uniqueSessions.length} Session IDs (First: ${uniqueSessions[0]})`);
    }

    if (uniqueUAs.length) {
      rtn.push('User Agents:');
      _.each(uniqueUAs, function (entry) {
        rtn.push(`- ${entry}`);
      });
    }

    if (Object.keys(tagGroups).length) {
      rtn.push('Request tags:');
      _.each(tagGroups, function (entries, tag) {
        rtn.push(`- [${entries.length}] ${tag}`);
      });
    }
    rtn.push('\n');
  });


  rtn.push(`-- Top ${LOG_LIMIT} Sessions --`);

  _.each(sessions, function (val, key) {
    const uniqueUAs = Object.keys(_.groupBy(val, 'userAgent'));
    const uniqueIps = Object.keys(_.groupBy(val, 'ip'));

    rtn.push(`[${val.length}] ${key}`);

    if (uniqueUAs.length > 1) {
      rtn.push('');
      rtn.push('User Agents:');
      _.each(uniqueUAs, function (entry) {
        rtn.push(`- ${entry}`);
      });
    }
    if (uniqueIps.length > 1) {
      rtn.push('');
      rtn.push('IPs:');
      _.each(uniqueIps, function (entry) {
        rtn.push(`- ${entry}`);
      });
    }
  });

  return rtn.join('\n');
}

module.exports = {
  generateFrameSummaryMessage
};
