var fs = require('fs');
var URL = require('url');

var log = require('./log.js');
var repos = require('./repos.js');
var au = require('./apputil.js');

function saveIssue(req, res, query) {
  var repo = repos.open(query.root || '.');

  var i = repo.saveIssue(req.body);

  au.serveJson(res, i);
}

function list(req, res, query) {
  var repo = repos.open(query.root || '.');

  var il = repo.list();

  au.serveJson(res, il);
}

function tagCloud(req, res, query) {
  var repo = repos.open(query.root || '.');

  au.serveJson(res, repo.tagCloud());
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
    au.serveJson(res, id);
  } else {
    res.status(404);
  }
}

var clients = 0;

function startClient(req, res, query) {
  clients++;

  au.serveJson(res, {"result":""});
}

function endClient(req, res, query) {
  if (--clients <= 0) {
    au.serveJson(res, {"result":"ok"});

    if (!req.config.no_autoquit) {
      process.exit();
    }
  }
}

module.exports = {
  saveIssue,
  list,
  tagCloud,
  getIssue,
  startClient,
  endClient
}
