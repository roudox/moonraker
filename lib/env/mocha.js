var Mocha  = require('mocha')
  , config = require('moonraker').config
  , path   = require('path');

process.on('message', function (msg) {

  if (msg.mocha) {
    var reporter = (config.reporter == 'html') ? '../../../lib/html-reporter' : config.reporter;
    var mocha = new Mocha({
      reporter: reporter,
      timeout: '60000',
      slow: '10000'
    });

    mocha.addFile(
      path.join('node_modules', 'moonraker', 'lib', 'env', 'yadda.js')
    );

    mocha.run(function (failures) {
      process.exit(failures);
    });
  }
});
