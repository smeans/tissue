var fs = require('fs');
var path = require('path');
var package = require('../package.json');

var log = require('./log.js');

var self = module.exports = {
  default_folder_name: 'issues',
  default_archive_folder_name: 'archive',
  init: function (base) {
    base = base || '.';

    try {
      var root = path.join(base, self.default_folder_name);

      if (!self.isRepo(root)) {
        if (!fs.existsSync(root)) {
          fs.mkdirSync(root);
        }

        var tj = {version: package.version};

        fs.writeFileSync(path.join(root, 'tissue.json'), JSON.stringify(tj));

        log.info('initialized ' + base + ' as a tissue repository');
      }
    } catch (e) {
      log.error('unable to init folder', base, ': ', e);

      return false;
    }

    return true;
  },
  isRepo: function (root) {
    root = path.join(root, self.default_folder_name);

    return fs.existsSync(root) && fs.existsSync(path.join(root, 'tissue.json'));
  },
  open: function (path) {
    return self.isRepo(path) ? new Repo(path) : null;
  }
};

function Repo(root) {
  this.ipath = path.join(root, self.default_folder_name);
};

Repo.prototype.repoFiles = function () {
  if (!this.icache) {
    this.icache = fs.readdirSync(this.ipath);
  }

  return this.icache;
}

Repo.prototype.list = function () {
  return this.repoFiles().filter(n => path.extname(n) == '.md').map((v) => v.substring(0, v.length-'.md'.length));
}

Repo.prototype.findIssueFile = function (issue_id) {
  const m = this.repoFiles().filter(n => n.startsWith(`${issue_id}-`));

  return m.pop();
}

Repo.prototype.tagCloud = function () {
  var repo = this;
  var tcd = {};

  repo.repoFiles().filter(n => path.extname(n) == '.md').forEach(function (f) {
    var issue_id = path.basename(f).split('-')[0];

    var ip = repo.issuePath(issue_id);
    var it = fs.readFileSync(repo.issuePath(issue_id)).toString();

    var tma = it.match(/[\#\@]\w+/g);
    if (tma) {
      tma.forEach(function (t) {
        if (!(t in tcd)) {
          tcd[t] = [];
        }
        tcd[t].push(issue_id);
      });
    }
  });

  return tcd;
}

Repo.prototype.saveIssue = function (i) {
  if (!('issue_id' in i)) {
    i.issue_id = Date.now().toString(36);
  }

  i.issue_key = i.issue_id + '-' + i.title;

  var oifn = this.findIssueFile(i.issue_id);
  var ifn = i.issue_key + '.md';
  
  if (oifn && ifn != oifn) {
    fs.rename(path.join(this.ipath, oifn), path.join(this.ipath, ifn), (e) => {
      if (e) {
        log.error(`error renaming issue ${i.issue_id}`, e);
      }
    });
  }

  var ifc = '# ' + i.title + '\n' + (i.description || '(description)') + '\n';

  log.debug('writing file', path.join(this.ipath, ifn));
  fs.writeFileSync(path.join(this.ipath, ifn), ifc);

  return i;
}

Repo.prototype.archiveIssue = function (issue_id) {
  const ap = path.join(this.ipath, self.default_archive_folder_name);

  const ifn = this.findIssueFile(issue_id);

  if (!ifn) {
    return false;
  }

  if (!fs.existsSync(ap)) {
    fs.mkdirSync(ap);
  }

  fs.rename(path.join(this.ipath, ifn), path.join(ap, ifn), (e) => {
    if (e) {
      log.error(`error archiving issue ${issue_id}`, e);
    }
  });

  return true;
}

Repo.prototype.issuePath = function (issue_id) {
  var fa = this.repoFiles().filter(n => n.indexOf(issue_id + '-') == 0);

  return fa.length > 0 ? path.resolve(path.join(this.ipath, fa[0])) : null;
}

Repo.prototype.issueJson = function (issue_id) {
  var md = fs.readFileSync(this.issuePath(issue_id), 'utf8');

  var lines = md.split('\n');
  var id = {issue_id, title: lines[0].substring(2), description: lines.slice(1).join('\n')};

  return id;
}
