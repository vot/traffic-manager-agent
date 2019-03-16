const storage = require('../lib/storage');

const reporters = {
  // hq: require('./hq'),
  // stdout: require('./stdout'),
  // file: require('./file'),
  // slack: require('./slack'),
};

function triggerReporters() {
  // check threshold for each reporter
  // grab frame/event
  // format message and dispatch through reporter

  // reporters.stdout.reportFrame();
  // reporters.hq.reportFrame();

  // rotate frame after reporting on it
  // storage.reset();
}

module.exports = {triggerReporters};
