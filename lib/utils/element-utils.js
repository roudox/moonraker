var session = require('../env/session')
  , util = require('util')
  , webdriver = require('selenium-webdriver');

module.exports = {

  defaultSelectorType: webdriver.By.css,

  findElement: function (selector) {
    return session.getDriver().findElement(this.defaultSelectorType(selector));
  },

  findElements: function (selector) {
    return session.getDriver().findElements(this.defaultSelectorType(selector));
  },

  findSelect: function (selector) {
    var self = this;
    var elem = this.findElement(selector);
    elem.selectOption = function (option) {
      elem.click();
      elem.findElement(self.defaultSelectorType(util.format("option[value='%s']",
        option.toString() ))).click();
    }
    return elem;
  },

  findLink: function (linkText) {
    return session.getDriver().findElement(webdriver.By.partialLinkText(linkText));
  },

};
