var log = require('./log.js');
var repos = require('./repos.js');
var au = require('./apputil.js');

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
      var root = config.root || '.';

      var repo = repos.open(root);
      if (repo) {
        var issues = repo.list();
        issues.map(n => console.log(n));
      } else {
        log.error(root + ' is not a tissue repository');
      }
    },

    'new': function () {
      var root = config.root || '.';

      var repo = repos.open(root);
      if (!repo) {
        log.error(root + ' is not a tissue repository');

        return;
      }
      if (config._.length <= 1) {
        log.error('usage: tissue new "issue title"');

        return;
      }

      var i = repo.saveIssue({title: config._[1]});

      const ip = repo.issuePath(i.issue_id);
      log.debug('ip', ip, 'i', i)

      if (ip) {
        au.launchDoc(ip);
      }
    },

    'edit': function () {
      var root = config.root || '.';

      var repo = repos.open(root);
      if (repo) {
        if (config._.length > 1) {
          var ip = repo.issuePath(config._[1]);

          if (ip) {
            au.launchDoc(ip);
          }
        } else {
          log.error('usage: tissue edit issue_id');
        }
      } else {
        log.error(root + ' is not a tissue repository');
      }
    }
  };

  if (cmd in dispatch) {
    dispatch[cmd]();
  } else {
    log.error('usage: tissue (' + Object.keys(dispatch).join('|') + ')');
  }
}
