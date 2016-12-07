var path = require('path');

var mimemap = require('./mimemap.json');

function typeForPath(p) {
  var ext = path.extname(p);

  return ext in mimemap ? mimemap[ext] : mimemap['*'];
}

module.exports = {
  typeForPath
}
