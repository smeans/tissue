var exec = require('child_process').exec;

function launchDoc(path) {
  var cmd;

  switch (process.platform) {
    case 'darwin': {
      cmd = 'open ' + path;
    } break;

    case 'win32':
    case 'win64': {
      cmd = 'start ' + path;
    } break;

    default: {
      cmd = 'xdg-open "' + path + '"';
    } break;
  }

  exec(cmd);
}

module.exports = {
  launchDoc
}
