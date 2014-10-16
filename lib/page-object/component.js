var elementUtils = require('../utils/element-utils')
  , util         = require('util');

var Component = function () {};

Component.create = function () {
  var _super = this;
  var ComponentObj = function() { _super.apply(this, arguments[0]) };
  ComponentObj.prototype = Object.create(_super.prototype, arguments[0]);
  ComponentObj.prototype.constructor = ComponentObj;
  return new ComponentObj();
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
