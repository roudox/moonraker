var driver    = require('../../lib/env/driver')
  , webdriver = require('selenium-webdriver')
  , util      = require('util');

var Component = function () {};

Component.create = function () {
  var _super = this;
  var ComponentObj = function() { _super.apply(this, arguments[0]) };
  ComponentObj.prototype = Object.create(_super.prototype, arguments[0]);
  ComponentObj.prototype.constructor = ComponentObj;
  return new ComponentObj();
};

Component.prototype = Object.create({}, {
  driver:   { get: function () { return driver.getInstance(); } },
  strategy: { get: function () { return webdriver.By.css } },
  element:  { value: function (selector) {
    return this.driver.findElement(this.strategy(util.format("%s %s", this.rootNode, selector)));
  } },
  elements: { value: function (selector) {
    return this.driver.findElements(this.strategy(util.format("%s %s", this.rootNode, selector)));
  } }
});

exports = module.exports = Component;
