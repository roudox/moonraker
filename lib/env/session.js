var webdriver = require('selenium-webdriver'),
    fs        = require('fs'),
    path      = require('path'),
    url       = require('url'),
    wrench    = require('wrench'),
    config,
    driver;

module.exports = {

  create: function () {
    config = require('moonraker').config;
    driver = new webdriver.Builder()
      .usingServer(config.seleniumServer)
      .withCapabilities(config.browser)
      .build();
    driver.manage().timeouts().implicitlyWait(config.elementTimeout);
    driver.manage().window().maximize();
  },

  execute: function (fn) {
    return webdriver.promise.controlFlow().execute(fn);
  },

  resizeWindow: function (x, y) {
    driver.manage().window().setSize(x, y);
  },

  saveScreenshot: function (name) {
    var filename = name.replace(/\W+/g, '-').toLowerCase() + '.png';
    driver.takeScreenshot().then(function (data) {
      fs.writeFileSync(path.join(config.resultsDir, 'screenshots', filename), data, 'base64');
    });
  },

  deleteAllCookies: function () {
    driver.manage().deleteAllCookies();
  },

  addCookie: function (name, value, optDomain, optPath, optIsSecure){
    driver.manage().addCookie(name, value, optDomain, optPath, optIsSecure);
  },

  getCookie: function (cookieName) {
    return driver.manage().getCookie(cookieName);
  },

  getDriver: function() {
    return driver;
  },

  reset: function () {
    webdriver.promise.controlFlow().execute(function () {
      driver.manage().deleteAllCookies();
      driver.get("about:blank");
    });
  },

  refresh: function () {
    driver.navigate().refresh();
  },

  currentUrl: function (parsedUrlHandler) {
    driver.getCurrentUrl().then(function (currentUrl) {
      parsedUrlHandler(url.parse(currentUrl));
    });
  },

  savePerfLog: function (name) {
    var dir = path.join(config.resultsDir, 'perf_logs');
    wrench.mkdirSyncRecursive(dir);
    var perfLog = [];
    driver.manage().logs().get('performance').then(function (logs) {
      logs.forEach(function (log) {
        var level = JSON.parse(log.message);
        perfLog.push(level.message);
      });
      fs.writeFileSync(path.join(dir, name + '.json'), JSON.stringify(perfLog));
    });
  }

};
