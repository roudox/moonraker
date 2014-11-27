var Yadda   = require('yadda'),
    session = require('moonraker').session,
    config  = require('moonraker').config,
    glob    = require('glob'),
    chai    = require('chai'),
    path    = require('path'),
    fs      = require('fs');

Yadda.plugins.mocha.StepLevelPlugin.init();
chai.should();

var pid = process.pid.toString();
var featuresDir = path.join(config.featuresDir, 'temp', pid);
var resultsFile = path.join(config.resultsDir, pid + '.json');
var result  = { features: [] };

new Yadda.FeatureFileSearch(featuresDir).each(function (file) {  

  featureFile(file, function (feature) {

    if (shouldIgnore(feature.annotations)) return;
    if (!shouldInclude(feature.annotations)) return;

    result.features.push({ title: feature.title, description: feature.description });

    scenarios(feature.scenarios, function (scenario) {
      steps(scenario.steps, function (step, done) {
        if (step === scenario.steps[0]) {
          session.reset();
        }
        session.execute(function () {
          new Yadda.Yadda(loadDefinitions()).yadda(step);
        }).then(done);
      });
    });
  });
});

fs.writeFileSync(resultsFile, JSON.stringify(result));

function shouldIgnore(annotations) {
  if(!config.tags) return false;
  var ignoreTags = filterTagArgs(config.tags).ignore;
  return isTagged(ignoreTags, annotations);
}

function shouldInclude(annotations) {
  if(!config.tags) return true;
  var includeTags = filterTagArgs(config.tags).include;
  if (includeTags.length < 1) return true;
  if (annotations.pending) return true;
  return isTagged(includeTags, annotations);
}

function filterTagArgs(tagArgs) {
  var tags = { include: [], ignore: [] };
  tagArgs.split(',').forEach(function (tag) {
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

function isTagged(tagsArr, annotations) {
  var match = false;
  Object.keys(annotations).forEach(function (key) {
    if (tagsArr.indexOf(key) > -1) match = true;
  });
  return match;
}

function loadDefinitions() {
  var dictionary = new Yadda.Dictionary();
  var library = new Yadda.localisation.English.library(dictionary);
  glob.sync(config.stepsDir + "/**/*.js").forEach(function (file) {
    var fileName = file.replace('.js', '');
    var steps = require('../../../../' + fileName);
    steps.define(library);
  });
  return library;
}

before(function (done) {
  session.create();
  done();
});

afterEach(function () {
  if (this.currentTest.state !== 'passed') {
    session.saveScreenshot(this.currentTest.title);
  }
});

after(function (done) {  
  session.getDriver().quit().then(done);
});
