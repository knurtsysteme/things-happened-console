var fs = require('fs');
var path = require('path');
var log = require('verbalize');
var argv = require('minimist')(process.argv.slice(2));
var commands = require('./commands.json');

var getKnownCommands = function() {
  var result = [];
  var i = commands.length;
  while (i--) {
    result.push(commands[i].name);
  }
  return result;
};
var knownCommands = getKnownCommands();

var getCommandObject = function(command) {
  var result = false;
  var i = commands.length;
  while (i--) {
    if (commands[i].name == command) {
      result = commands[i];
      break;
    }
  }
  return result;
};

var usage = function(command, errorMessage, exitCode) {
  command = typeof command == 'string' ? getCommandObject(command) : command;

  if (errorMessage) {
    log.error(errorMessage);
  }

  var scriptname = path.basename(__filename).replace(/\.js$/, '');

  var logCommandparameters = function(parameters) {
    log.info('Usage: ' + scriptname + ' ' + command.name + ' <parameters>\r\n');
    var hasRequiredParameter = false;
    var hasOptionalParameter = false;
    parameters.forEach(function(parameter) {
      if (parameter.required)
        hasRequiredParameter = true
      else
        hasOptionalParameter = true
    });
    if (hasRequiredParameter) {
      log.info('Where required <parameters>:');
      parameters.forEach(function(parameter) {
        if (parameter.required)
          log.info('\t' + parameter.name + '\r\n\t\t' + parameter.description);
      });
    }
    if (hasOptionalParameter) {
      log.info('Where optional <parameters>:');
      parameters.forEach(function(parameter) {
        if (!parameter.required) {
          var defaultTxt = (typeof (parameter.defaultValue != 'undefined') ? ' (Default: ' + parameter.defaultValue + ')' : '');
          log.info('\t' + parameter.name + defaultTxt + '\r\n\t\t' + parameter.description);
        }
      });
    }
  }

  if (command) {
    logCommandparameters(command.parameters);
  } else {
    log.info('Usage: ' + scriptname + ' <command>\r\nWhere <command> is one of:');
    var i = commands.length;
    while (i--) {
      log.info('\t' + commands[i].name + ': ' + commands[i].description);
    }
  }
  if (exitCode) {
    process.exit(exitCode);
  }
};

var command = getCommandObject(argv._[0]);
if (!command) {
  log.error('Please provide a valid <command>');
  usage();
  process.exit(1);
}

// Verbalize `runner`
log.runner = 'things-happened-cli';

require('./thc-' + command.name + '.js')(argv, usage);
