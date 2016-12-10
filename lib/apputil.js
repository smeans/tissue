var exec = require('child_process').exec;

var log = require('./log.js');

function launchDoc(path) {
  var cmd;

  switch (process.platform) {
    case 'darwin': {
      cmd = 'open "' + path + '"';
    } break;

    case 'win32':
    case 'win64': {
      cmd = 'start "' + path + '"';
    } break;

    default: {
      cmd = 'xdg-open "' + path + '"';
    } break;
  }

  log.debug('launchDoc: ' , cmd);

  exec(cmd);
}

module.exports = {
  launchDoc
}
