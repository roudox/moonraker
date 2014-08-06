var fs        = require('fs')
  , path      = require('path')
  , webdriver = require('selenium-webdriver')
  , config    = require('../../../../config.json')
  , driver;

module.exports = {

  build: function () {
    driver = new webdriver.Builder().usingServer().withCapabilities(config.browser).build();
    driver.manage().timeouts().implicitlyWait(10000);
    driver.manage().window().maximize();
  },

  getInstance: function () {
    return driver;
  },

  takeScreenshot: function (name) {
    var filename = name.replace(/\W+/g, '-').toLowerCase() + '.png';
    driver.takeScreenshot().then(function (data) {
      fs.writeFileSync(path.join(config.resultsDir, 'screenshots', filename), data, 'base64');
    });
  },

  executeInFlow: function (fn, done) {
    webdriver.promise.controlFlow().execute(fn).then(function () {
      done();
    }, done);
  }
};
