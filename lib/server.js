var fs = require('fs');
var path = require('path');
var http = require('http');
var anyBody = require('body/any');
var qs = require('querystring');
var URL = require('url');
var format = require('string-template');

var log = require('./log.js');
var mimetype = require('./mimetype.js');

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

       if (req.method == 'GET') {
         var p = req.url.split('?');

         if (p.length > 1) {
           req.query = qs.parse(p[1]);
         } else {
           req.query = {};
         }

         jsr[mpa[1]](req, res, url.query);

         res.end();
       } else {
         anyBody(req, res, {}, function (err, body) {
           if (err) {
             res.statusCode = 400;
             log.debug('request error', err);
             return res.end(JSON.stringify({error:'bad request', message:err.toString()}));
           }

           req.body = body;

           jsr[mpa[1]](req, res, url.query);

           res.end();
         });
       }
     } catch (e) {
       log.debug(e);

       serveFile(400, '/400.html', res);
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
