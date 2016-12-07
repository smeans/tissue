var log = require('./log.js');
var repos = require('./repos.js');

function serveJson(res, data) {
  var body = JSON.stringify(data);

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body, 'utf8')
  });

  res.write(body);
}

function saveIssue(req, res, query) {
  var repo = repos.open('.');

  var i = repo.saveIssue(req.body);

  serveJson(res, i);
}

function list(req, res, query) {
  var repo = repos.open('.');

  var il = repo.list();

  serveJson(res, il);  
}

module.exports = {
  saveIssue,
  list
}
