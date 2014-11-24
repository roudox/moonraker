var session = require('../env/session');

module.exports = {

  newObj: function () {
    var _super = this;
    var Obj = function () { _super.apply(this, arguments[0]); };
    Obj.prototype = Object.create(_super.prototype, arguments[0]);
    Obj.prototype.constructor = Obj;
    return new Obj();
  },

  visit: function () {
    var config = require('moonraker').config;
    if (this.url.indexOf('http://') > -1) {
      session.getDriver().get(this.url);
    } else {
      session.getDriver().get(config.baseUrl + this.url);
    }

    if (typeof this.onLoad === 'function') {
      session.execute(this.onLoad);
    }
  },

  title: function (titleHandler) {
    session.getDriver().getTitle().then(function (title) {
      titleHandler(title);
    });
  }

};
