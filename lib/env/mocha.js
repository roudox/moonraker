var Mocha  = require('mocha')
  , config = require('../../../../config.json');

process.on('message', function (msg) {

  if (msg.mocha) {
    var reporter = (config.reporter == 'html') ? '../../../lib/html-reporter' : config.reporter;
    var mocha = new Mocha({
      reporter: reporter,
      timeout: '60000',
      slow: '10000'
    });

    mocha.addFile(
      'node_modules\\moonraker\\lib\\env\\yadda.js'
    );

    mocha.run(function (failures) {
      process.exit(failures);
    });
  }
});
