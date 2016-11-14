var levels = ['error', 'warn', 'info', 'debug'];

function write(level, args) {
  if (levels.indexOf(level) > levels.indexOf(module.exports.level)) {
    return;
  }

  var message = args.reduce(function (p, c) {
    return typeof c == 'object' ? (p ? p + ': ' + JSON.stringify(c) : JSON.stringify(c)) : (p ? p + ' ' + c.toString() : c.toString());
  }, '');

  var ts = (new Date()).toISOString();
  console.log(ts + ': ' + level + ': ' + message);
}

module.exports = {
  levels,
  level: process.env.LOG_LEVEL || 'info',
  error: function (message) { write('error', Array.from(arguments)); },
  warn: function (message) { write('warn', Array.from(arguments)); },
  info: function (message) { write('info', Array.from(arguments)); },
  debug: function (message) { write('debug', Array.from(arguments)); }
};
