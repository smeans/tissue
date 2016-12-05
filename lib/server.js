var fs = require('fs');
var path = require('path');
var http = require('http');
var anyBody = require('body/any');
var qs = require('querystring');
var URL = require('url');

var log = require('./log.js');

var self = module.exports = function (config) {
   log.debug('starting tissue server');

   var root = __dirname;

   var url_map = {'/':'/index.html'};

   var js_handlers = {};

   function handleJSRequest(req, res) {
     try {
       var url = URL.parse(req.url, true);
       var handler = url.pathname.substring('/~'.length);
       var mpa = handler.split('::');

       var jsr = mpa[0] in js_handlers ? js_handlers[mpa[0]] : (js_handlers[mpa[0]] = require(path.join(root, mpa[0] + '.js')));

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
             return res.end(JSON.stringify({error:'bad request', message:err.toString()}));
           }

           req.body = body;

           jsr[mpa[1]](req, res, url.query);

           res.end();
         });
       }
     } catch (e) {
       log.debug(e);

       req.url = "/www_public/400.html";

       var rs = fs.createReadStream(path.join(root, req.url));
       log.debug(rs);
       res.pipe(rs);
     }
   }

   var server = http.createServer(function (req, res) {
      log.info(__dirname);
      req.original_url = req.url;

      if (req.url.indexOf('/~') === 0) {
       handleJSRequest(req, res);

       return;
      }

      if (req.url in url_map) {
       req.url = url_map[req.url];
      }

      req.url = '/www_public' + req.url;

      if (fs.existsSync(path.join(root, req.url))) {
        var rs = fs.createReadStream(path.join(root, req.url));
        log.debug(rs);
        res.pipe(rs);
      } else {
        for (var k in js_handlers) {
         if ('handle404' in js_handlers[k]) {
           if (js_handlers[k].handle404(req, res)) {
             return;
           }
         }
        }

        req.url = "/www_public/404.html";
        var rs = fs.createReadStream(path.join(root, req.url));
        log.debug(rs);
        res.pipe(rs);
      }
   });

   server.listen(config.port || 4000);
}
