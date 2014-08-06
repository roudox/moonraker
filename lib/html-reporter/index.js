var Base   = require('mocha').reporters.Base
  , fs     = require('fs')
  , path   = require('path')
  , driver = require('moonraker').Driver
  , config = require('../../../../config.json');

exports = module.exports = MoonrakerJson;

function MoonrakerJson(runner) {

  Base.call(this, runner);

  var result = { features: [] };
  var feature = null;
  var scenario = null;
  var level = 0;

  runner.on('end', function () {
    result.stats = this.stats;
    fs.writeFileSync(path.join(config.resultsDir, process.pid.toString() + '.json'), JSON.stringify(result));
  });

  runner.on('suite', function (suite) {
    if (suite.root) return;
    if (!feature) {
      feature = {
        title: suite.title,
        scenarios: []
      };
    } else {
      scenario = {
        title: suite.title,
        steps: []
      };
      level++;
    }
  });

  runner.on('suite end', function (suite) {
    if (suite.root) return;
    if (level == 0) {
      result.features.push(feature);
      feature = null;
    } else {
      feature.scenarios.push(scenario);
      scenario = null;
      level--;
    }
  });

  runner.on('pass', function (test) {
    scenario.steps.push({
      title: test.title,
      status: 'pass',
      speed: test.speed,
      duration: test.duration
    });
  });

  runner.on('pending', function (test) {
    scenario.steps.push({
      title: test.title,
      status: 'pending'
    });
  });

  runner.on('fail', function (test) {
    var errorStr = test.err.stack || test.err.toString();
    if (!~errorStr.indexOf(test.err.message)) {
       errorStr = test.err.message + '\n' + errorStr;
    }
    if (!test.err.stack && test.err.sourceURL && test.err.line !== undefined) {
       errorStr += "\n(" + test.err.sourceURL + ":" + test.err.line + ")";
    }
    var screenshotPath;
    if (driver.getInstance() != null) {
      screenshotPath = test.title.replace(/\W+/g, '-').toLowerCase() + '.png';
    }
    scenario.steps.push({
      title: test.title,
      status: 'failed',
      speed: test.speed,
      duration: test.duration,
      error: errorStr,
      screenshot: screenshotPath
    });
  });
}
