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

Repo.prototype.list = function () {
  return fs.readdirSync(this.ipath).filter(n => path.extname(n) == '.md');
}
