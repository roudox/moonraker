var childProcess = require('child_process')
  , mkdirp       = require('mkdirp')
  , config       = require('../../../config.json')
  , glob         = require('glob')
  , fs           = require('fs')
  , path         = require('path')
  , rimraf       = require('rimraf')
  , builder      = require('../lib/html-reporter/builder');

var workingDir = path.join(config.featuresDir, 'temp');

if (fs.existsSync(workingDir)) {
  rimraf.sync(workingDir);
}

mkdirp.sync(path.join(config.resultsDir, 'screenshots'));

var features = glob.sync(config.featuresDir + "/**/*.feature");
var queues = split(features, config.threads);
var pid = null;

queues.forEach(function(queue) {

  var thread = childProcess.fork('./node_modules/moonraker/lib/env/mocha');
  pid = thread.pid.toString();
  mkdirp.sync(path.join(config.featuresDir,'temp', pid));

  queue.forEach(function(featureFile) {
    filename = featureFile.split('/').pop();
    fs.writeFileSync(path.join(config.featuresDir, 'temp', pid, filename),
      fs.readFileSync(featureFile));
  });

  thread.send({ mocha: true });
});

process.on('exit', function() {
  if (config.reporter == 'html') {
    builder.createHtmlReport();
  }
  rimraf.sync(workingDir);
});

function split(features, threads) {
  var len = features.length, queues = [], i = 0;
  while (i < len) {
    var size = Math.ceil((len - i) / threads--);
    queues.push(features.slice(i, i + size));
    i += size;
  }
  return queues;
}
