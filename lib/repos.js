var fs = require('fs');
var path = require('path');
var package = require('../package.json');

var log = require('./log.js');

var self = module.exports = {
  default_folder_name: 'issues',
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

Repo.prototype.saveIssue = function (i) {
  if (!('issue_id' in i)) {
    i.issue_id = Date.now().toString(36);
  }

  i.issue_key = i.issue_id + ': ' + i.title;

  var ifn = i.issue_key + '.md';
  var ifc = '# ' + i.title + '\n' + (i.description || '(description)') + '\n';

  fs.writeFileSync(path.join(this.ipath, ifn), ifc);

  return i;
}

Repo.prototype.issuePath = function (issue_id) {
  var fa = this.repoFiles().filter(n => n.indexOf(issue_id + ':') == 0);

  return fa.length > 0 ? path.resolve(path.join(this.ipath, fa[0])) : null;
}
