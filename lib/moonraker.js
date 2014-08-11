var session     = require('./env/session')
  , Page        = require('./page-object/page')
  , Component   = require('./page-object/component');

exports = module.exports = {
  session: session,
  Page: Page,
  Component: Component
};
