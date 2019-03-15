'use strict';

const _ = require('lodash');
const config = require('../config');
// const slackLib = require('./slackLib');
const storage = require('./storage');

const MONITORING_FRAME_SEC = 600;
const MIN_REQUEST_THRESHOLD = 10;
const LOG_LIMIT = 5;

const LAST_FRAME_TS_PRECISE = 0;

function logSummary(data) {
  const totalRequestsCounter = _.get(data, 'stats.total');
  const blockedRequestsCounter = _.get(data, 'stats.blocked');
  const minuteRate = Math.ceil(totalRequestsCounter / (MONITORING_FRAME_SEC / 60));

  const tagSummaryString = _.compact(_.map(data.tagSummary, function (tag) {
    if (!tag.key || tag.key === 'undefined') {
      return false;
    }
    return `- [${tag.count} requests] ${tag.key}`;
  })).join('\n');

  console.log(`Blocked requests: ${blockedRequestsCounter}`);
  console.log(`Total requests: ${data.stats.total} (${minuteRate}/min)`);
  console.log();
  console.log('-- Top Request Types --');
  console.log(tagSummaryString);
  console.log();

  console.log(data.message);

  const slackEnabled = config.get('reporters.slack.enabled', false);
  const slackHookURL = config.get('reporters.slack.hookUrl', '');

  // optional Slack integration
  if (slackEnabled && typeof slackHookURL === 'string' && slackHookURL.length) {
    const tsAsString = data.timestamp.toString();
    const tsNonprecise = tsAsString.substr(0, (tsAsString.length - 3));

    const slackMsg = {
      // text: msg,
      username: 'Traffic Monitoring',
      icon_emoji: ':gear:', // jshint ignore:line
      attachments: [
        {
          title: 'Access Log insights',
          pretext: `Requests in the last ${MONITORING_FRAME_SEC} seconds`,
          fallback: data.message,
          text: data.message,
          color: '#3A4',
          'footer': data.instanceId,
          'ts': tsNonprecise,
          fields: [
            {
              'title': 'Total requests',
              value: `${data.stats.total} (${minuteRate}/min)`
            },
            {
              'title': 'Blocked requests',
              'value': blockedRequestsCounter
            },
            {
              'title': 'Request type breakdown',
              'value': tagSummaryString
            }
          ]
        }
      ]
    };

    slackLib.notify(slackMsg, '/services/' + slackHookURL, (err) => {});
  }
}

function constructSummaryMessage(ips, sessions, systemStats) {
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

function trigger() {
  const confFrameDuration = config.get('policies.samplingFrameSeconds');
  const newFrameDurationParsed = parseInt(confFrameDuration, 10);
  const newFrameDuration = (confFrameDuration == newFrameDurationParsed) ? newFrameDurationParsed : 600;

  if (newFrameDuration !== MONITORING_FRAME_SEC) {
    console.log('setting newFrameDuration', newFrameDuration);
    MONITORING_FRAME_SEC = newFrameDuration;
  }

  const now = Date.now();
  const exp = LAST_FRAME_TS_PRECISE + (MONITORING_FRAME_SEC * 1000);

  if (now > exp) {
    console.log(`> Logging requests in the last ${MONITORING_FRAME_SEC} seconds`);

    const sortedIPs = storage.getSummaryByCriteria('ip', {limit: LOG_LIMIT});
    const sortedSessions = storage.getSummaryByCriteria('sessionId', {limit: LOG_LIMIT});
    const tagSummary = storage.getSummaryByCriteria('tag');
    const systemStats = storage.getSystemStats();

    const msg = constructSummaryMessage(sortedIPs, sortedSessions, systemStats);

    if (Object.keys(sortedIPs).length) {
      const slackData = {
        message: msg,
        // instanceId: 'localhost #0',
        timestamp: now
      };

      slackData.stats = systemStats;
      slackData.tagSummary = tagSummary;

      logSummary(slackData);
    }

    storage.reset();
    LAST_FRAME_TS_PRECISE = now;
  }
}

module.exports = {
  trigger
};
