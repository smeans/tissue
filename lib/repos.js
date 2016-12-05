var fs = require('fs');
var path = require('path');
var package = require('../package.json');

var log = require('./log.js');

var self = module.exports = {
  default_folder_name: 'issues',
  init: function (root) {
    try {
      root = path.join(root, self.default_folder_name);

      if (!self.isRepo(root)) {
        if (!fs.existsSync(root)) {
          fs.mkdirSync(root);          
        }

        var tj = {min_version: package.version};

        fs.writeFileSync(path.join(root, 'tissue.json'), JSON.stringify(tj));
      }
    } catch (e) {
      log.error('unable to init folder', root, ': ', e);

      return false;
    }

    return true;
  },
  isRepo: function (root) {
    root = path.join(root, self.default_folder_name);

    return fs.existsSync(root) && fs.existsSync(path.join(root, 'tissue.json'));
  },
  find: function (path) {

  }
};

function Repo() {

};
