var fs = require('fs'),
    util = require('util'),
    config = require('moonraker').config,
    path = require('path'),
    glob = require('glob'),
    Handlebars = require('handlebars');

module.exports.createHtmlReport = function() {
  Handlebars.registerHelper('ifEqual', function(a, b, options) {
    if( a != b ) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });
  var data = mergeJson('results/*.json');
  var source = loadDoc('template.html');
  var template = Handlebars.compile(source);
  var result = template(data);
  fs.writeFileSync(path.join(config.resultsDir, 'index.html'), result);
  copyCss();
};

function mergeJson(pattern) {
  var merged = {
    stats: {
      passes: 0,
      failures: 0,
      duration: 0,
      threads: config.threads
    },
    features: []
  };

  files = glob.sync(pattern);
  var durations = [];

  files.forEach(function (file) {
    thread = JSON.parse(fs.readFileSync(file));
    merged.stats.passes += thread.stats.passes;
    merged.stats.failures += thread.stats.failures;
    durations.push(thread.stats.duration);

    thread.features.forEach(function (feature) {
      merged.features.push(feature);
    });
    merged.features = sortByFeature(merged.features);

    fs.unlinkSync(file);
  });
  merged.stats.duration = Math.max.apply(Math, durations) / 1000;
  return merged;
}

function sortByFeature(features) {
  return features.sort(function (a, b) {
    a = a.title.toLowerCase();
    b = b.title.toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0;
  });
}


function loadDoc(doc) {
  return fs.readFileSync('node_modules/moonraker/lib/html-reporter/assets/' + doc).toString();
}

function copyCss() {
  fs.writeFileSync(path.join(config.resultsDir, 'style.css'),
    fs.readFileSync('node_modules/moonraker/lib/html-reporter/assets/style.css'));
}
