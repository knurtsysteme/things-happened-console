var request = require('request');
var path = require('path');
var fs = require('fs');
var log = require('verbalize');
var command = path.basename(__filename).substr(4).replace(/\.js$/, '');

module.exports = function(argv, usage) {
  var file = argv.f || argv.file;
  var hostname = argv.hostname || 'things-happened.org';
  var port = argv.p || argv.port || 80;
  var things = argv.t || argv.things;
  var happened = argv.h || argv.happened || false;
  var verbose = argv.v || argv.verbose || false;
  var secret = argv.s || argv.secret || false;
  var init = argv.i || argv.init ? true : false;

  var path = '/get/' + things;
  if (happened) {
    path += '/' + happened;
  }
  path += '.json';

  if (!things) {
    usage(command, 'Missing things to request', 1409122039);
  }

  var params = {};
  if (secret) {
    params.criteria = {
      _secret : secret
    };
  }

  var url = 'http://' + hostname + (port != 80 ? ':' + port : '') + path;
  if (verbose) {
    log.info('GET ' + url);
  }

  request({
    url : url,
    json : true,
    qs : params
  }, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      if (file) {
        fs.writeFile(file, JSON.stringify(body), function(err) {
          if (err) {
            log.error(err);
          } else if (verbose) {
            log.info(body.length + ' things put to ' + file);
          }
        });
      } else {
        log.info(JSON.stringify(body));
      }
    } else {
      log.error(error);
      process.exit(1409122159);
    }
  });

}