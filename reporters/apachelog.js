'use strict';

function reporter() {
  const rtn = '89.0.3.4 - - [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326';
  return rtn;
}

module.exports = {
  reporter
};