var fs         = require('fs'),
    config     = require('moonraker').config,
    path       = require('path'),
    glob       = require('glob'),
    Handlebars = require('handlebars'),
    wrench     = require('wrench'),
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
};

function mergeResults(pattern) {
  var result = {
    stats: {
      passes: 0,
      failures: 0,
      duration: 0,
      threads: config.threads
    },
    features: []
  };

  var files = glob.sync(pattern);
  var durations = [];

  files.forEach(function (file) {
    thread = JSON.parse(fs.readFileSync(file));
    result.stats.passes += thread.stats.passes;
    result.stats.failures += thread.stats.failures;
    durations.push(thread.stats.duration);

    thread.features.forEach(function (feature) {
      result.features.push(feature);
    });
    result.features = sortByFeature(result.features);

    fs.unlinkSync(file);
  });
  result.stats.duration = Math.max.apply(Math, durations) / 1000;
  return result;
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
