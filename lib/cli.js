var log = require('./log.js');
var repos = require('./repos.js');

var self = module.exports = function (config) {
  var cmd = config._[0];

  log.debug('tissue cli:', cmd);

  var dispatch = {
    'init': function () {
      var root = config._.length > 1 ? config._[1] : '.';

      log.debug('initializing', root);
      repos.init(root);
    }
  };

  dispatch[cmd]();
}
