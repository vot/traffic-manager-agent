const _ = require('lodash');
const config = require('../../config');
const storage = require('../storage');

function generateTrafficLoadAvgSummaryForFrame(repConfig) {
  const topEntriesLimit = _.get(repConfig, 'topEntriesLimit', 5);

  const sortedIPs = storage.getSummaryByCriteria('ip', { limit: topEntriesLimit });
  const sortedSessions = storage.getSummaryByCriteria('sessionId', { limit: topEntriesLimit });
  // const tagSummary = storage.getSummaryByCriteria('tag');
  const systemStats = storage.getSystemStats();

  const frameDurationSeconds = config.get('settings.frameDurationSeconds');
  const requestsPerMinute = Math.ceil(systemStats.total / (frameDurationSeconds / 60));

  const frameSummaryData = {
    sortedIPs,
    sortedSessions,
    // tagSummary,
    systemStats,
    requestsPerMinute,
    frameDurationSeconds,
  };

  return frameSummaryData;
}

module.exports = generateTrafficLoadAvgSummaryForFrame;
