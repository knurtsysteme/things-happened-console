var request = require('request');
var path = require('path');
var log = require('verbalize');
var command = path.basename(__filename).substr(4).replace(/\.js$/, '');

module.exports = function(argv, usage) {
  var file = argv.f || argv.file;
  var hostname = argv.hostname || 'things-happened.org';
  var port = argv.p || argv.port || 80;
  var things = argv.t || argv.things;
  var happened = argv.h || argv.happened;
  var verbose = argv.v || argv.verbose || false;
  var secret = argv.s || argv.secret || false;
  var init = argv.i || argv.init ? true : false;
  // TODO support argument to append something to every object
  // var append = argv.a || argv.append || false;

  var inputJson = null;
  var path = '/addto/' + things + '/' + happened + '.json';
  var url = 'http://' + hostname + (port != 80 ? ':' + port : '') + path;
  if (verbose) {
    log.info('POST to ' + url);
  }

  if (!file) {
    usage(command, 'Missing source file', 2);
  }

  if (!things) {
    usage(command, 'Missing target to things', 3);
  }
  if (!happened) {
    usage(command, 'Missing target to happened', 3);
  }

  try {
    inputJson = require(file);
  } catch (e) {
    usage(command, 'Error reading file ' + file + ':\r\n\t' + e, 4);
  }

  var postObject = function(object) {
    if (init) {
      for ( var property in object) {
        if (property.match(/^_.+/)) {
          delete object[property];
        }
      }
    }
    if (secret) {
      object._secret = secret;
    }
    request.post({
      url : url,
      headers : {
        'content-type' : 'application/x-www-form-urlencoded'
      },
      body : require('querystring').stringify(object)
    }, function(error, response, body) {
      if (verbose) {
        log.info('Response: ' + body);
      }
    });
  }

  if (Array.isArray(inputJson)) {
    inputJson.forEach(postObject);
  } else {
    postObject(inputJson);
  }
}