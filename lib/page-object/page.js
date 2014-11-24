var session      = require('../env/session'),
    pageUtils    = require('../utils/page-utils'),
    elementUtils = require('../utils/element-utils');

var Page = function () {};

Page.prototype = Object.create({}, {
  visit:      { value: pageUtils.visit },
  title:      { value: pageUtils.title },
  element:    { value: function (selector) { return elementUtils.findElement(selector); } },
  elements:   { value: function (selector) { return elementUtils.findElements(selector); } },
  select:     { value: function (selector) { return elementUtils.findSelect(selector); } },
  link:       { value: function (linkText) { return elementUtils.findLink(linkText); } },
  waitFor:    { value: function (fn, timeout) { return elementUtils.waitFor(fn, timeout); } },
  component:  { value: function (component, rootNode) {
    component.rootNode = rootNode;
    return component;
  } },
  alert: { get: function () { return elementUtils.alert(); } }
});

Page.create = pageUtils.newObj;
exports = module.exports = Page;
