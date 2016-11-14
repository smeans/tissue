var fs = require('fs');

var log = require('./log.js');

var self = module.exports = {
  default_folder_name: 'issues',
  init: function (path, isComplete) {
    try {
      if (!isComplete) {
        path += '/' + self.default_folder_name;
      }

      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
    } catch (e) {
      log.error('unable to init folder', path, ': ', e);
      return false;
    }

    return true;
  },
  find: function (path) {

  }
};

function Repo() {

};
