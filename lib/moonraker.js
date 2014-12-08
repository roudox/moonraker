var session     = require('./env/session'),
    Page        = require('./page-object/page'),
    Component   = require('./page-object/component'),
    nconf       = require('nconf');

nconf.argv().env().file('config.json');

exports = module.exports = {
  config:    nconf.get(),
  session:   session,
  Page:      Page,
  Component: Component
};
