## Moonraker

...a lightweight BDD style web testing framework for node, with Yadda, Selenium, page objects and support for parallel testing.

### Install

To use this framework you need to add this to your package.json:

```json
"dependencies": {
  "private-repo": "git+ssh://git@github.com:LateRoomsGroup/moonraker.git"
},
"scripts": {
  "test": "node node_modules/moonraker/bin/moonraker.js"
}
```

...and then `$ npm install`.

### Configuration

Moonraker is configured using a config.json file in your project root to setup the base_url, feature/step directory paths and browser instance etc:

```json
{
  "baseUrl": "http://www.laterooms.com",
  "featuresDir": "tests/features",
  "stepsDir": "tests/steps",
  "reporter": "spec",
  "threads": 1,

  "browser": {
    "browserName": "chrome",
    "chromeOptions": {
      "args": ["--test-type"]
    }
  }
}
```

The directory paths are used to tell Yadda where to find your feature and step definition (library) files. The browser object is used to setup the selenium driver and can be used like any selenium ['Desired Capabilities'](https://code.google.com/p/selenium/wiki/DesiredCapabilities).

### Example project

You will find a full example test project in the `/example` folder with everything you need to start using Moonraker - sample feature/scenario, page objects and config.json in a suggested project structure. `$ npm test` will run the example tests in chrome, so you will need the latest [chromedriver](http://chromedriver.storage.googleapis.com/index.html) downloaded and available on your path.

### Yadda

Tests for Moonraker are written using [Yadda](https://github.com/acuminous/yadda), a BDD implementation very similar to [Cucumber](http://cukes.info/) and run using the [Mocha](http://visionmedia.github.io/mocha/) JavaScript test framework.

Just like Cucumber, Yadda maps ordinary language steps to code, but can be quite flexible by not limiting you to a certain syntax (Given, When, Then) and allowing you to define your own...

```
Feature: Searching from the homepage

  Scenario: Simple Search

    Given I visit the home page
    When I search for 'Manchester'
    Then I should see 'Manchester Hotels' in the heading
    Whatever language I like here
```

```javascript
var define = function (steps) {

  steps.given("I visit the home page", function () {
    // some code
  });

  steps.when("I search for '$query'", function (query) {
    // some code
  });

  steps.then("I should see '$heading' in the heading", function (heading) {
    // some code
  });

  steps.define("Whatever language I like here", function() {
    // some code
  });

};

exports.define = define;
```

Although Yadda can support multiple libraries, Moonraker currently loads all step definitions found in the steps directory into one big shared library, just like cucumber, so you have to be careful of name clashes.

### Page objects

Moonraker makes full use of the Page Object pattern to model and abstract interactions with pages to reduce duplicated code and make tests easy to update as/when the UI changes.

Page objects are created as below:

```javascript
var Page = require('moonraker').Page;

module.exports = Page.create({

  url: { value: '/' },

  txtSearch: { get: function () { return this.element("input[id='txtSearch']"); } },
  btnSearch: { get: function () { return this.element("button[class='btn-primary']"); } },

  searchFor: { value: function (query) {
    this.txtSearch.sendKeys(query);
    this.btnSearch.click();
  }}

});
```

Each page has a url (relative to your baseUrl set in the config), some elements and any convenient methods that may be required. Elements are found by css selectors and return a selenium webelement which can be interacted with as normal. These page objects can then be used in your step definitions:

```javascript
var homePage = require('../pages/home');
var searchResults = require('../pages/search-results');

var define = function (steps) {

  steps.given("I visit the home page", function () {
    homePage.visit();
  });

  steps.when("I search for '$query'", function (query) {
    homePage.txtSearch.sendKeys(query);
    homePage.btnSearch.click();
    // Or use homePage.searchFor(query);
  });

  steps.then("I should see '$heading' in the heading", function (heading) {
    searchResults.heading.getText().then(function (text) {
      text.should.equal(heading);
    });
  });

};

exports.define = define;
```

### Assertions

Moonraker uses the 'should' style of the [Chai](http://chaijs.com/guide/styles/) assertion library.

### Reporting

As the tests are run using Mocha, you can use any of Mocha's [reporters](http://visionmedia.github.io/mocha/#reporters).
Just set the required reporter in the config. Moonraker also comes with a 'html' reporter (as Mocha's only works when run in the browser) that also works correctly when running in parallel.

