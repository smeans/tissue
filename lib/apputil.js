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
      cmd = '"' + path + '"';
    } break;

    default: {
      cmd = 'xdg-open "' + path + '"';
    } break;
  }

  log.debug('launchDoc: ' , cmd);

  exec(cmd);
}

function serveData(mimetype, res, body, status) {
  status = status || 200;
  res.writeHead(status, {
    'Content-Type': mimetype,
    'Content-Length': Buffer.byteLength(body, 'utf8')
  });

  res.write(body);
}

function serveJson(res, data, status) {
  status = status || 200;
  var body = JSON.stringify(data);

  serveData('application/json', res, body, status);
}

module.exports = {
  launchDoc,
  serveData,
  serveJson
}
