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

  const tc = repo.tagCloud();
  log.debug('tag cloud', tc);
  au.serveJson(res, repo.tagCloud());
}

function getIssue(req, res, query) {
  var url = URL.parse(req.url, true);
  var upa = url.pathname.split('/');

  if (upa.length < 2) {
    res.statusCode = 400;
    return;
  }

  var repo = repos.open(query.root || '.');
  var issue_id = upa[2].split('-')[0];

  var ij = repo.issueJson(issue_id);

  if (ij) {
    au.serveJson(res, ij);
  } else {
    res.statusCode = 404;
  }
}

function archiveIssue(req, res, query) {
  var url = URL.parse(req.url, true);
  var upa = url.pathname.split('/');

  var repo = repos.open(query.root || '.');
  var issue_id = req.body.issue_id;

  if (!issue_id) {
    res.statusCode = 400;

    return;
  }

  var ifn = repo.issuePath(issue_id);

  if (ifn) {
    res.statusCode = repo.archiveIssue(issue_id) ? 200 : 500;
  } else {
    res.statusCode = 404;
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
  archiveIssue,
  startClient,
  endClient
}
