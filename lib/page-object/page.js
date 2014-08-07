var driver    = require('../../lib/env/driver')
  , webdriver = require('selenium-webdriver')
  , config    = require('../../../../config.json')
  , url       = require('url')
  , util      = require('util');

var Page = function () {};

Page.create = function () {
  var _super = this;
  var PageObj = function() { _super.apply(this, arguments[0]) };
  PageObj.prototype = Object.create(_super.prototype, arguments[0]);
  PageObj.prototype.constructor = PageObj;
  return new PageObj();
};

Page.prototype = Object.create({}, {
  driver:     { get: function () { return driver.getInstance(); } },
  flow:       { get: function () { return webdriver.promise.controlFlow(); } },
  strategy:   { get: function () { return webdriver.By.css } },
  visit:      { value: visit },
  title:      { value: title },
  currentUrl: { value: currentUrl },
  element:    { value: function (selector) { return this.driver.findElement(this.strategy(selector)); } },
  elements:   { value: function (selector) { return this.driver.findElements(this.strategy(selector)); } },
  component:  { value: function (component, rootNode) {
    component.rootNode = rootNode;
    return component;
  } },
});

exports = module.exports = Page;

function visit() {
  if (this.url.indexOf('http://') > -1) {
    this.driver.get(this.url);
  } else {
    this.driver.get(config.baseUrl + this.url);
  }
};

function title(titleHandler) {
  this.driver.getTitle().then(function (title) {
    titleHandler(title)
  });
}

function currentUrl(parsedUrlHandler) {
  this.driver.getCurrentUrl().then(function (currentUrl) {
    parsedUrlHandler(url.parse(currentUrl));
  });
}

