var fs = require('fs');
var path = require('path');
var http = require('http');
var URL = require('url');
var format = require('string-template');

var log = require('./log.js');
var mimetype = require('./mimetype.js');
var au = require('./apputil.js');

function parseBody(req, callback) {
  var chunks = [];

  req.on('data', function (chunk) {
    chunks.push(chunk);
  });

  req.on('end', function () {
    var raw = Buffer.concat(chunks).toString('utf8');
    if (!raw) {
      return callback(null, {});
    }

    var type = (req.headers['content-type'] || '').split(';')[0].trim();

    if (type === 'application/x-www-form-urlencoded') {
      try {
        var params = new URL.URLSearchParams(raw);
        var parsed = {};
        params.forEach(function (value, key) {
          parsed[key] = value;
        });
        return callback(null, parsed);
      } catch (err) {
        return callback(err);
      }
    }

    if (type === 'application/json' || type === 'text/json') {
      try {
        return callback(null, JSON.parse(raw));
      } catch (err) {
        return callback(err);
      }
    }

    try {
      return callback(null, JSON.parse(raw));
    } catch (e) {
      return callback(null, raw);
    }
  });

  req.on('error', callback);
}

var context = {test: "test string"};

var root = __dirname + '/www_public';

function serveFile(status, p, res) {
  var p = path.join(root, p);
  var stat = fs.statSync(p);
  var cb = stat.size;
  var mt = mimetype.typeForPath(p);

  if (mt.startsWith("text/")) {
    var fc = fs.readFileSync(p).toString('utf8');
    rt = format(fc, context);

    res.writeHead(status, {
      'Content-Type': mt,
      'Content-Length': rt.length
    });

    res.write(rt);
    res.end();
  } else {
    res.writeHead(status, {
      'Content-Type': mt,
      'Content-Length': cb
    });

    var rs = fs.createReadStream(p);
    rs.pipe(res);
  }
}

var self = module.exports = function (config) {
   log.debug('starting tissue server');

   var url_map = {'/':'/index.html'};

   var js_handlers = {};

   function handleJSRequest(req, res) {
     try {
       var url = URL.parse(req.url, true);
       var upa = url.pathname.split('/');
       var handler = upa[1].substring('~'.length);
       var mpa = handler.split('::');

       var jsr = mpa[0] in js_handlers ? js_handlers[mpa[0]] : (js_handlers[mpa[0]] = require(path.join(__dirname, mpa[0] + '.js')));

       req.config = config;

       if (req.method == 'GET') {
         req.query = url.query || {};

         jsr[mpa[1]](req, res, url.query);

         res.end();
       } else {
         parseBody(req, function (err, body) {
           if (err) {
             log.debug('request error', err);
             au.serveJson(res, {error:'bad request', message:err.toString()}, 400);
             res.end();

             return;
           }

           req.body = body;

           jsr[mpa[1]](req, res, url.query);

           res.end();
         });
       }
     } catch (e) {
       log.debug('bad request', e.toString());
       au.serveJson(res, {error:'bad request', message:e.toString()}, 400);
       res.end();
     }
   }

   var server = http.createServer(function (req, res) {
      req.original_url = req.url;

      if (req.url.indexOf('/~') === 0) {
       handleJSRequest(req, res);

       return;
      }

      if (req.url in url_map) {
       req.url = url_map[req.url];
      }

      log.debug('serving ' + req.url);

      if (fs.existsSync(path.join(root, req.url))) {
        serveFile(200, req.url, res);
      } else {
        for (var k in js_handlers) {
         if ('handle404' in js_handlers[k]) {
           if (js_handlers[k].handle404(req, res)) {
             return;
           }
         }
        }

        serveFile(404, '/404.html', res);
      }
   });

   var port = config.port || 4000;
   server.listen(port);

   return 'http://localhost:' + port;
}
