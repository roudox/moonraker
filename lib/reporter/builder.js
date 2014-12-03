var fs         = require('fs'),
    config     = require('moonraker').config,
    path       = require('path'),
    glob       = require('glob'),
    Handlebars = require('handlebars'),
    wrench     = require('wrench'),
    util       = require('util'),
    reporterPath;

module.exports.createHtmlReport = function() {
  Handlebars.registerHelper('ifEqual', function(a, b, options) {
    if( a != b ) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  reporterPath = path.join('node_modules', 'moonraker', 'lib', 'reporter');

  var data = mergeResults(path.join(config.resultsDir, '*.json'));
  var source = fs.readFileSync(path.join(reporterPath, 'template.html'));
  var template = Handlebars.compile(source.toString());
  var result = template(data);

  copyAssets();
  fs.writeFileSync(path.join(config.resultsDir, 'index.html'), result);
  logSummary(data);
};

function mergeResults(pattern) {
  var stats = {
    passes: 0,
    failures: 0,
    skipped: 0,
    duration: 0,
    threads: config.threads
  };
  var features = [];
  var durations = [];

  glob.sync(pattern).forEach(function (file) {
    thread = JSON.parse(fs.readFileSync(file));
    stats.passes += (thread.stats.passes - thread.stats.skipped);
    stats.failures += thread.stats.failures;
    stats.skipped += thread.stats.skipped;
    durations.push(thread.stats.duration);

    thread.features.forEach(function (feature) {
      features.push(feature);
    });
    features = sortByFeature(features);
    fs.unlinkSync(file);
  });
  stats.duration = Math.max.apply(Math, durations) / 1000;
  return { stats: stats, features: features };
}

function sortByFeature(features) {
  return features.sort(function (a, b) {
    a = a.title.toLowerCase();
    b = b.title.toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

function copyAssets() {
  var source = path.join(reporterPath, 'assets');
  var dest   = path.join(config.resultsDir, 'assets');
  wrench.copyDirSyncRecursive(source, dest);
}

function logSummary(result) {
  console.log(config.icinga ? icingaMsg(result.stats) : stdMsg(result.stats));
}

function icingaMsg(stats) {
  var status = stats.failures > 0 ? 'CRITICAL' : 'OK';
  var serviceMsg = util.format("MOONRAKER %s - OK: %d, Critical: %d, Warning: %d", status,
    stats.passes, stats.failures, stats.skipped);

  var perfMsg = util.format("passed=%d; failed=%d; skipped=%d; total=%d; time=%d", stats.passes,
    stats.failures, stats.skipped, stats.passes + stats.failures + stats.skipped, stats.duration);

  return util.format("%s | %s", serviceMsg, perfMsg);
}

function stdMsg(stats) {
  var status = stats.failures > 0 ? 'failed' : 'passed';
  var msg = "Moonraker tests %s!\nPassed:%d\nFailed:%d\nSkipped:%d\nDuration:%d";
  return util.format(msg, status, stats.passes, stats.failures, stats.skipped, stats.duration);
}
