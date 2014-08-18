var fs = require('fs')
  , util = require('util')
  , config = require('moonraker').config
  , path = require('path')
  , glob = require('glob');

module.exports.createHtmlReport = function() {
  var all = mergeJson('results/*.json');
  var html = formatJson(all);
  fs.writeFileSync(path.join(config.resultsDir, 'results.html'), html);
  copyCss();
}

function formatJson(json) {
  var html = "";
  html += loadDoc('head.html');
  html += util.format('<ul id="moonraker-stats"><li class="progress"><canvas width="40" height="40"></canvas></li>' +
    '<li class="passes"><a href="#">passes: </a><em>%s</em></li>' +
    '<li class="failures"><a href="#">failures: </a><em>%s</em></li>' +
    '<li class="duration">duration: <em>%s</em>s</li>' +
    '<li class="threads">threads: <em>%s</em></li></ul>',
    json.stats.passes, json.stats.failures, json.stats.duration / 1000, config.threads);
  html += util.format('<ul id="report">');

  json.features.forEach(function (feature) {
    html += util.format('<li class="feature"><h1>Feature: %s</h1><ul>', htmlEscape(feature.title));

    feature.scenarios.forEach(function (scenario) {
      html += util.format('<li class="scenario"><h1>Scenario: %s</h1><ul>', htmlEscape(scenario.title));
      scenario.steps.forEach(function (step) {

        if (step.status == "pass") {
          html += util.format('<li class="step pass %s">', step.speed);
          html += util.format('<h2>%s<span class="duration">%s</span></h2>', htmlEscape(step.title), step.duration);
          html += '</li>';

        } else if (step.status == "pending") {
          html += util.format('<li class="step pass pending">');
          html += util.format('<h2>%s</h2>', htmlEscape(step.title));
          html += '</li>';

        } else {
          html += util.format('<li class="step fail"><h2>%s</h2>', htmlEscape(step.title));
          html += util.format('<pre class="error">%s</pre></li>', htmlEscape(clean(step.error)));
          html += util.format('<li class="step fail"><h2>Screenshot</h2><pre style="display: none;">' +
                        '<img src="screenshots/%s" width="1280"></pre></li>', step.screenshot);
        }
      });
      html += util.format('</ul></li>');
    });
    html += util.format('</ul></li>');
  });
  html += loadDoc('tail.html');
  return html;
}

function mergeJson(pattern) {
  var merged = {
    stats: {
      passes: 0,
      failures: 0,
      duration: 0
    },
    features: []
  };
  files = glob.sync(pattern);

  files.forEach(function (file) {
    thread = JSON.parse(fs.readFileSync(file));
    merged.stats.passes += thread.stats.passes;
    merged.stats.failures += thread.stats.failures;
    merged.stats.duration += thread.stats.duration;

    thread.features.forEach(function (feature) {
      merged.features.push(feature);
    });
    merged.features = sortByFeature(merged.features);

    fs.unlinkSync(file);
  });
  return merged;
}

function sortByFeature(features) {
  return features.sort(function (a, b) {
    a = a.title.toLowerCase();
    b = b.title.toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

function htmlEscape(html) {
    return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

function clean(str) {
  str = str
    .replace(/^function *\(.*\) *{/, '')
    .replace(/\s+\}$/, '');

  var spaces = str.match(/^\n?( *)/)[1].length
    , re = new RegExp('^ {' + spaces + '}', 'gm');

  str = str.replace(re, '');

  return str.replace(/^\s+|\s+$/g, '');
};

function loadDoc(doc) {
  return fs.readFileSync('node_modules/moonraker/lib/html-reporter/docs/' + doc).toString();
};

function copyCss() {
  fs.writeFileSync(path.join(config.resultsDir, 'style.css'),
    fs.readFileSync('node_modules/moonraker/lib/html-reporter/style.css'));
};
