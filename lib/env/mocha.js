var config  = require('moonraker').config,
    session = require('moonraker').session,
    Mocha   = require('mocha'),
    path    = require('path');

process.on('message', function (msg) {

  if (msg.mocha) {

    session.thread = msg.thread;
    session.queue = msg.queue;

    var reporter = (config.reporter == 'moonraker') ? '../../../lib/reporter' : config.reporter;
    var mocha = new Mocha({
      reporter: reporter,
      timeout: config.testTimeout,
      slow: config.slow || 10000
    });

    mocha.addFile(
      path.join('node_modules', 'moonraker', 'lib', 'env', 'yadda.js')
    );

    mocha.run(function (failures) {
      process.exit(failures);
    });
  }
  
});
