var config       = require('moonraker').config,
    session      = require('moonraker').session,
    childProcess = require('child_process'),
    fs           = require('fs'),
    path         = require('path'),
    wrench       = require('wrench'),
    Yadda        = require('yadda'),
    builder      = require('../lib/reporter/builder');

resetWorkSpace();

var features = parseFeatures(config.featuresDir);
var queues   = createQueues(features, config.threads);
var failed   = false;
var tags;

queues.forEach(function(queue, index) {
  var thread = childProcess.fork('./node_modules/moonraker/lib/env/mocha', process.argv);
  thread.send({ mocha: true, thread: index + 1, queue: queue });
  thread.on("exit", function(code) {
    if (code > 0) failed = true;
  });
});

process.on('exit', function() { 
  if (config.reporter === 'moonraker') {
    builder.createHtmlReport();
  }
  if (failed) {
    throw new Error("Moonraker tests failed. :(");
  }
});

function resetWorkSpace() {
  if (fs.existsSync(config.resultsDir)) {
    wrench.rmdirSyncRecursive(config.resultsDir);
  }
  wrench.mkdirSyncRecursive(path.join(config.resultsDir, 'screenshots'));
}

function parseFeatures(dir) {
  if (config.tags) {
    tags = sortTagOpts(config.tags);
  }
  var features = [];

  new Yadda.FeatureFileSearch(dir).each(function (file) {
    var English = require('yadda').localisation.English;
    var parser = new Yadda.parsers.FeatureFileParser(English);
    var feature = parser.parse(file);

    if (!config.tags) {
      features.push(feature);
    } else if (shouldInclude(feature.annotations)) {
      features.push(feature);
    }

  });
  return features;
}

function createQueues(features, threads) {
  var len = features.length, queues = [], i = 0;
  while (i < len) {
    var size = Math.ceil((len - i) / threads--);
    queues.push(features.slice(i, i + size));
    i += size;
  }
  return queues;
}

function shouldInclude(annotations) {  
  if (annotations.pending) return true;
  if (isTagMatch(tags.ignore, annotations)) return false;
  if (isTagMatch(tags.include, annotations)) return true;
  if (tags.include.length < 1) return true;
}

function sortTagOpts(tagOpts) {
  var tags = { include: [], ignore: [] };
  tagOpts.split(',').forEach(function (tag) {
    if (tag.indexOf('!@') > -1) {
      tags.ignore.push(stripTag(tag));
    } else {
      tags.include.push(stripTag(tag));
    }
  });
  return tags;
}

function stripTag(tag) {
  return tag.replace('!', '').replace('@', '');
}

function isTagMatch(tagsArr, annotations) {
  var match = false;
  Object.keys(annotations).forEach(function (key) {
    if (tagsArr.indexOf(key) > -1) match = true;
  });
  return match;
}
