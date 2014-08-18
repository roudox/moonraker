var Yadda   = require('yadda')
  , session = require('moonraker').session
  , config  = require('moonraker').config
  , glob    = require('glob')
  , chai    = require('chai')
  , path    = require('path');

Yadda.plugins.mocha.AsyncStepLevelPlugin.init();
chai.should();

var featuresDir = path.join(config.featuresDir, 'temp', process.pid.toString());
new Yadda.FeatureFileSearch(featuresDir).each(function (file) {

  featureFile(file, function (feature) {
    scenarios(feature.scenarios, function (scenario) {
      steps(scenario.steps, function (step, done) {
        session.executeInFlow(function () {
          new Yadda.Yadda(loadSteps()).yadda(step);
        }, done);
      });
    });

    afterEach(function () {
      if (this.currentTest.state !== 'passed') {
        session.saveScreenshot(this.currentTest.title);
      }
    });
  });
});

function loadSteps() {
  var dictionary = new Yadda.Dictionary();
  var library = new Yadda.localisation.English.library(dictionary);
  findSteps().forEach(function (file) {
    var fileName = file.replace('.js', '');
    var steps = require('../../../../' + fileName);
    steps.define(library);
  });
  return library;
}

function findSteps() {
  return glob.sync(config.stepsDir + "/**/*.js");
}

before(function (done) {
  session.create();
  done();
});

after(function (done) {
  session.getDriver().quit().then(done);
});
