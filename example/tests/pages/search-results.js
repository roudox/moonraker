var Page = require('moonraker').Page;

module.exports = Page.create({

  heading: { get: function () { return this.element("h1"); } }

});
