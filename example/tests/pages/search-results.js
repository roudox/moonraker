var Page = require('moonraker').Page;

module.exports = new Page({

  heading: { get: function () { return this.element("h1"); } }

});
