var elementUtils = require('../utils/element-utils'),
    util         = require('util');

var Component = function (props) {
  return Object.create(this, props);
};

Component.prototype = Object.create({}, {
  element: { value: function (selector) {
    return elementUtils.findElement(util.format("%s %s", this.rootNode, selector));
  } },
  elements: { value: function (selector) {
    return elementUtils.findElements(util.format("%s %s", this.rootNode, selector));
  } },
  select: { value: function (selector) {
    return elementUtils.findSelect(util.format("%s %s", this.rootNode, selector));
  } },
  link: { value: function (linkText) {
    return elementUtils.findScopedLink(this.rootNode, linkText);
  } },
  waitFor: { value: function (fn, timeout) { return elementUtils.waitFor(fn, timeout); } }
});

exports = module.exports = Component;
