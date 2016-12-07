var log = require('./log.js');
var repos = require('./repos.js');

var self = module.exports = function (config) {
  var cmd = config._[0];

  log.debug('tissue cli:', cmd);

  var dispatch = {
    'init': function () {
      var root = config._.length > 1 ? config._[1] : '.';

      if (repos.isRepo(root)) {
        log.warn(root, 'is already a tissue repository');
        process.exit(1);
      }

      log.debug('initializing', root);
      repos.init(root);
      log.debug(root, 'initialized');
    },

    'list': function () {
      var root = config._.length > 1 ? config._[1] : '.';

      var repo = repos.open(root);
      if (repo) {
        var issues = repo.list();
        issues.map(n => console.log(n));
      } else {
        log.error(root + ' is not a tissue repository');
      }
    }
  };

  dispatch[cmd]();
}
