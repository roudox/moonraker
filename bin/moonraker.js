var childProcess = require('child_process'),
    config       = require('moonraker').config,
    glob         = require('glob'),
    fs           = require('fs'),
    path         = require('path'),
    wrench       = require('wrench'),
    builder      = require('../lib/reporter/builder');

var workingDir = path.join(config.featuresDir, 'temp');
resetWorkSpace();

var features = glob.sync(config.featuresDir + "/**/*.feature");
var queues   = split(features, config.threads);
var failed   = false;

queues.forEach(function(queue, index) {

  var thread = childProcess.fork('./node_modules/moonraker/lib/env/mocha', process.argv);
  var pid = thread.pid.toString();
  wrench.mkdirSyncRecursive(path.join(config.featuresDir,'temp', pid));

  queue.forEach(function(featureFile) {
    filename = featureFile.split('/').pop();
    fs.writeFileSync(path.join(config.featuresDir, 'temp', pid, filename),
      fs.readFileSync(featureFile));
  });

  thread.send({ mocha: true, thread: index + 1 });
  thread.on("exit", function(code) {
    if (code > 0) failed = true;
  });
});

process.on('exit', function() { 
  if (config.reporter == 'moonraker') {
    builder.createHtmlReport();
  }
  removeDir(workingDir);
  if (failed) {
    throw new Error("Moonraker tests failed. :(");
  }
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

function resetWorkSpace() {
  removeDir(workingDir);
  removeDir(config.resultsDir);
  wrench.mkdirSyncRecursive(path.join(config.resultsDir, 'screenshots'));
}

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    wrench.rmdirSyncRecursive(dir);
  }
}
