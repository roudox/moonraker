var Page = require('moonraker').Page;

module.exports = new Page({

  url: { value: '/' },

  txtSearch: { get: function () { return this.element("input[id='txtSearch']"); } },
  btnSearch: { get: function () { return this.element(".btn-primary"); } },

  searchFor: { value: function (query) {
    this.txtSearch.sendKeys(query);
    this.btnSearch.click();
  }}

});
