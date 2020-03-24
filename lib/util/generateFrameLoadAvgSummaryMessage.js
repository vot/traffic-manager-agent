const _ = require('lodash');

function generateFrameLoadAvgSummaryMessage(ips, sessions, stats, repConfig) {
  const rtn = [];
  const topEntriesLimit = _.get(repConfig, 'topEntriesLimit', 5);

  rtn.push(`-- Top ${topEntriesLimit} IPs --`);

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


  rtn.push(`-- Top ${topEntriesLimit} Sessions --`);

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

// request tagging done only in Traffic Manager Hub at the moment
//
// const tagSummaryString = _.compact(_.map(frame.tagSummary, (tag) => {
//   if (!tag.key || tag.key === 'undefined') {
//     return false;
//   }
//   return `- [${tag.count} requests] ${tag.key}`;
// })).join('\n');
// console.log('-- Top Request Types --');
// console.log(tagSummaryString);
// console.log();

module.exports = generateFrameLoadAvgSummaryMessage;
