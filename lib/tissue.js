var config = require('minimist')(process.argv.slice(2));
var server = require('./server.js');
var cli = require('./cli.js');
var log = require('./log.js');

log.debug('tissue configuration', config);

if (config._.length) {
  cli(config);
} else {
  server(config);
};
