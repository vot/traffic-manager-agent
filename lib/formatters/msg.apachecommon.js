'use strict';

function formatMessage(ev) {
  // generate log lines for a single request object and return formatted line
  // '89.0.3.4 - - [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326';
  const rtn = `${ev.ip} - - ${ev.timestamp} "GET ${ev.url} HTTP/1.0" ${ev.status} ${ev.responseSize}`;
  return rtn;
}

module.exports = {
  formatMessage
};
