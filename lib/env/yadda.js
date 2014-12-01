var session = require('moonraker').session,
    config  = require('moonraker').config,
    Yadda   = require('yadda'),
    glob    = require('glob'),
    chai    = require('chai'),
    path    = require('path'),
    fs      = require('fs');

Yadda.plugins.mocha.StepLevelPlugin.init();
chai.should();

features(session.queue, function (feature) {

  scenarios(feature.scenarios, function (scenario) {

    steps(scenario.steps, function (step, done) {
      if (step === scenario.steps[0]) {
        session.reset();
      }
      session.execute(function () {
        new Yadda.Yadda(loadStepDefs()).yadda(step);
      }).then(done);
    });

  });
});

function loadStepDefs() {
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
