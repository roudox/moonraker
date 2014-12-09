![Moonraker Logo](https://dl.dropboxusercontent.com/u/6598543/logo-black.png)

An easy to use lightweight web testing framework for Node, designed for speed, maintainability and collaboration.
Bringing together everything you need out of the box - familiar BDD features/scenarios, a simple page object library, parallel testing and pretty reports.

Integrating [Yadda](https://github.com/acuminous/yadda), [Selenium-Webdriver](https://code.google.com/p/selenium/wiki/WebDriverJs), [Mocha](http://mochajs.org/) & [Chai](http://chaijs.com/).


### Install

Moonraker can be installed via [npm](https://www.npmjs.org/) - `$ npm install moonraker`, or add `moonraker` to your `package.json`.


### Configure

Moonraker is configured using a `config.json` file in your project root:

```json
{
  "baseUrl": "http://www.laterooms.com",
  "featuresDir": "tests/features",
  "stepsDir": "tests/steps",
  "resultsDir": "results",
  "reporter": "moonraker",
  "threads": 1,

  "testTimeout": 60000,
  "elementTimeout": 5000,

  "browser": {
    "browserName": "chrome",
    "chromeOptions": {
      "args": ["--no-sandbox"]
    }
  }
}
```

* `baseUrl`        - Your base url, page object urls will be relative to this.
* `featuresDir`    - The path to your features directory.
* `stepsDir`       - The path to your step definitions directory.
* `resultsDir`     - The path you'd like your results output to.
* `reporter`       - The reporter type you'd like Moonraker to use (more on this below).
* `threads`        - The number of threads you'd like to run with.
* `testTimeout`    - The maximum test (scenario step) timeout before its marked as a fail (ms).
* `elementTimeout` - The maximum time selenium will continuously try to find an element on the page.
* `browser`        - An object describing your browser [desired capabilities](https://code.google.com/p/selenium/wiki/DesiredCapabilities).
* `seleniumServer` - Optional: Address of your remote selenium standalone server.

The example configuration above assumes using Chrome directly, to connect to a remote selenium server just add your server address to your `config.json`:

`"seleniumServer": "http://127.0.0.1:4444/wd/hub"`.

All of Moonraker's configuration options can be overridden when running your tests (see below) if you add command line args (e.g: `--baseUrl=http://www.example.com` or `--browser.browserName=phantomjs`) or have set environment variables. They will take preference over the `config.json`, in that order - command line args > env vars > config.

### Run your tests

To start Moonraker run `$ node node_modules/moonraker/bin/moonraker.js`, or to make things easier you can add a shortcut in your `package.json`:

```json
{
  "scripts": {
    "test": "node node_modules/moonraker/bin/moonraker"
  }
}
```
... so you can simply run `$ npm test`. Note, you cannot pass command line args using the `$ npm test` shortcut.

### Example project

You will find a full example project in the `/example` folder with everything you need to start using Moonraker - sample feature, step definitions, page objects and config in a suggested project structure.

The example tests use Chrome, so you will need the latest [chromedriver](http://chromedriver.storage.googleapis.com/index.html) downloaded and available on your path.



### Writing your tests

Tests for Moonraker are written using [Yadda](https://github.com/acuminous/yadda), a BDD implementation very similar to [Cucumber](http://cukes.info/) and run using the [Mocha](http://visionmedia.github.io/mocha/) JavaScript test framework.

Just like Cucumber, Yadda maps ordinary language steps to code, but can be quite flexible by not limiting you to a certain syntax (Given, When, Then) and allowing you to define your own...

```
Feature: Searching from the homepage

  Scenario: Simple Search

    Given I visit the home page
    When I search for 'Manchester'
    Whatever language I like here
```

```javascript
exports.define = function (steps) {

  steps.given("I visit the home page", function () {
    // some code
  });

  steps.when("I search for '$query'", function (query) {
    // some code
  });

  steps.define("Whatever language I like here", function() {
    // some code
  });

};

```

Although Yadda can support multiple libraries, Moonraker currently loads all step definitions found in your steps directory into one big shared library, just like Cucumber, so you have to be careful of step name clashes.

### Page objects

Moonraker makes full use of the Page Object pattern to model and abstract interactions with pages to reduce duplicated code and make tests easy to update as and when the UI changes.

To create a page object:

```javascript
// tests/pages/home.js

var Page = require('moonraker').Page;

module.exports = new Page({

  url: { value: '/' },

  txtSearch: { get: function () { return this.element("input[id='txtSearch']"); } },
  btnSearch: { get: function () { return this.element("button[class='btn-primary']"); } },

  searchFor: { value: function (query) {
    this.txtSearch.sendKeys(query);
    this.btnSearch.click();
  }}

});
```

Each page has a url, some elements and any convenient methods that you may require. Like the home page example above, urls should be relative to your 'baseUrl' set in your config, but "external" pages can also be used by using a full url.

Elements are found by css selector and return a selenium web-element which can be interacted with as [per usual](https://code.google.com/p/selenium/wiki/WebDriverJs).

You can then use your page objects in your step definitions:

```javascript
// tests/steps/home-search-steps.js

var homePage = require('../pages/home'),
    searchResults = require('../pages/search-results');

exports.define = function (steps) {

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

```

### Components

Components are exactly like page objects and allow you to group elements together into a component, then add that component itself to a page object.

```javascript
// tests/pages/components/nav.js

var Component = require('moonraker').Component

module.exports = new Component({

  selLanguage: { get: function () { return this.element('.locale select'); } },
  selCurrency: { get: function () { return this.element('.currency select'); } }

});
```

```javascript
// tests/pages/home.js

var Page = require('moonraker').Page,
    nav = require('./components/nav');

module.exports = new Page({

  url: { value: '/' },

  nav: { get: function () { return this.component(nav, "section[class='header']"); } },

  ...

});
```

Components are added to a page just like elements are but using:
`this.component(component, rootNode)` where 'component' is your component object, and 'rootNode' is a css selector representing your components root node on the page.

All elements in your component are then scoped to this rootNode, so in the above example the element `selLanguage` with its `.locale select` selector is only found within the `section[class='header']` element.

Your components can then be re-used across your page-objects and could appear in different places on the page.

Using your components:

```javascript
// tests/steps/home-search-steps.js

var homePage = require('../pages/home');

exports.define = function (steps) {

  steps.given("I visit the home page", function () {
    homePage.visit();
  });

  steps.when("I select my currency", function () {
    homePage.nav.selCurrency.click();
    // etc..
  });

});

```

### Assertions

The 'should' style of the [Chai](http://chaijs.com/guide/styles/) assertion library is available to use in your step definitions.


### Running your tests in parallel

Moonraker was designed with speed in mind and supports testing in parallel. To take advantage of this you simply need to increase the number of threads in the config.

Moonraker will split your feature files over the amount of threads set and starts a new child process (and browser) for each. If you have 4 feature files and want to use 2 threads, 2 features will be executed per thread / browser etc.

Parallel testing works as expected for remote driver connections just as it does locally. If you have powerful enough hardware to run your tests on and a large, high performing selenium grid instance to open connections to, you can dramatically reduce your test execution time.

At best, you will only be as quick as your longest running feature though, so if you have features with tons of scenarios in them you should think about breaking them down into smaller more manageable feature files.

### Reporting

As the tests are run using Mocha, you can use any of Mocha's [reporters](http://visionmedia.github.io/mocha/#reporters).
Just set the required reporter in the config.
As Mocha is designed to run serially though you will experience issues when running Moonraker in parallel, so Moonraker comes with its own custom reporter for Mocha.

To use it set the reporter in your config to `moonraker`. This reporter includes a Mocha spec-like console output and a html report saved to your results directory:

![Moonraker report](https://dl.dropboxusercontent.com/u/6598543/report.png)

The html report includes details of any errors and browser screen shots.
