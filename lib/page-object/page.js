var session      = require('../env/session')
  , elementUtils = require('../utils/element-utils')
  , url          = require('url');

var Page = function () {};

Page.create = function () {
  var _super = this;
  var PageObj = function() { _super.apply(this, arguments[0]) };
  PageObj.prototype = Object.create(_super.prototype, arguments[0]);
  PageObj.prototype.constructor = PageObj;
  return new PageObj();
};

Page.prototype = Object.create({}, {
  visit:      { value: visit },
  title:      { value: title },
  currentUrl: { value: currentUrl },
  element:    { value: function (selector) { return elementUtils.findElement(selector); } },
  elements:   { value: function (selector) { return elementUtils.findElements(selector); } },
  select:     { value: function (selector) { return elementUtils.findSelect(selector); } },
  link:       { value: function (linkText) { return elementUtils.findLink(linkText); } },
  waitFor:    { value: function (fn, timeout) { return elementUtils.waitFor(fn, timeout); } },
  component:  { value: function (component, rootNode) {
    component.rootNode = rootNode;
    return component;
  } },
});

exports = module.exports = Page;

function visit() {
  var config = require('moonraker').config;
  if (this.url.indexOf('http://') > -1) {
    session.getDriver().get(this.url);
  } else {
    session.getDriver().get(config.baseUrl + this.url);
  }
};

function title(titleHandler) {
  session.getDriver().getTitle().then(function (title) {
    titleHandler(title)
  });
}

function currentUrl(parsedUrlHandler) {
  session.getDriver().getCurrentUrl().then(function (currentUrl) {
    parsedUrlHandler(url.parse(currentUrl));
  });
}
