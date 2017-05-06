var fs = require('fs');
var URL = require('url');

var log = require('./log.js');
var repos = require('./repos.js');

function serveData(mimetype, res, body) {
  res.writeHead(200, {
    'Content-Type': mimetype,
    'Content-Length': Buffer.byteLength(body, 'utf8')
  });

  res.write(body);
}

function serveJson(res, data) {
  var body = JSON.stringify(data);

  serveData('application/json', res, body);
}

function saveIssue(req, res, query) {
  var repo = repos.open(query.root || '.');

  var i = repo.saveIssue(req.body);

  serveJson(res, i);
}

function list(req, res, query) {
  var repo = repos.open(query.root || '.');

  var il = repo.list();

  serveJson(res, il);
}

function getIssue(req, res, query) {
  var url = URL.parse(req.url, true);
  var upa = url.pathname.split('/');

  if (upa.length < 2) {
    res.status(400);
    return;
  }

  var repo = repos.open(query.root || '.');
  var issue_id = upa[2].split(':')[0];

  var id = repo.issueJson(issue_id);

  if (id) {
    serveJson(res, id);
  } else {
    res.status(404);
  }
}

var clients = 0;

function startClient(req, res, query) {
  clients++;

  serveJson(res, {"result":""});
}

function endClient(req, res, query) {
  if (--clients <= 0) {
    serveJson(res, {"result":"ok"});

    process.exit();
  }
}

module.exports = {
  saveIssue,
  list,
  getIssue,
  startClient,
  endClient
}
