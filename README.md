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
* `reporter`       - The reporter type you'd like Moonraker to use (more on this [below](#reporting)).
* `threads`        - The number of threads you'd like to run with.
* `testTimeout`    - The maximum test (scenario step) timeout before its marked as a fail (ms).
* `elementTimeout` - The maximum time selenium will continuously try to find an element on the page.
* `browser`        - An object describing your browser [desired capabilities](https://code.google.com/p/selenium/wiki/DesiredCapabilities).
* `seleniumServer` - Optional: Address of your remote selenium standalone server.

The example configuration above assumes using Chrome directly, to connect to a remote selenium server just add your server address to your `config.json`:

`"seleniumServer": "http://127.0.0.1:4444/wd/hub"`.

All of Moonraker's configuration options can be overridden when running your tests (see below) if you add command line args (e.g: `--baseUrl=http://www.example.com` or `--browser.browserName=phantomjs`) or have set environment variables. They will take preference over the `config.json`, in that order - command line args > env vars > config.

You can also add whatever you like to the config and access it in your code using: `var config = require('moonraker').config;`.

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

Each page has a url, some elements and any convenient methods that you may require.

Elements are found by css selector and return a selenium web-element which can be interacted with as [per usual](https://code.google.com/p/selenium/wiki/WebDriverJs). A full reference can be found [below](#page-object-reference).

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

As the tests are run using Mocha, you can use any of Mocha's [reporters](http://mochajs.org/#reporters).
Just set the required reporter in the config.
As Mocha is designed to run serially though you will experience issues when running Moonraker in parallel, so Moonraker comes with its own custom reporter for Mocha.

To use it set the reporter in your config to `moonraker`. This reporter includes a Mocha spec-like console output and a html report saved to your results directory:

![Moonraker report](https://dl.dropboxusercontent.com/u/6598543/report.png)

The html report includes details of any errors and includes browser screen shots.

### Page object reference

As the examples show, all interactions with page elements (and the underlying driver) are abstracted away in your page objects. When you create a page object you have various ways of attaching elements to it so they can be interacted with in your step definitions:

```javascript
var Page = require('moonraker').Page;

module.exports = new Page({

  url: { value: '/search' },

  aTxtInput:  { get: function () { return this.element("input[id='txtSearch']"); } },
  buttons:    { get: function () { return this.elements("button"); } },
  aSelect:    { get: function () { return this.select("select[name='rt-child']"); } },
  aLink:      { get: function () { return this.link("London Hotels"); } },
  aComponent: { get: function () { return this.component(yourComponent, "div[class='container']"); } },

});
```

* Setting a url value is for when you call `visit()` on your page object. e.g: `examplePage.visit();`. These url's are relative to the baseUrl set in your config, but if you set a full url like `http://www.example.com` the baseUrl will be ignored. Additionally, `visit()` can take an optional query object: `examplePage.visit({ foo: 'bar', baz: 'qux' });` will visit `http://yourBaseUrl/search?foo=bar&baz=qux`.

* `element(cssSelector)` - is used to find a specific element by css selector and returns a selenium element. e.g: `examplePage.aTxtInput.click();`

* `elements(cssSelector)` - is used to find all elements that satisfy the selector and returns a collection of selenium elements. e.g:
```javascript
examplePage.buttons.then(function (elems) {
  elems.forEach(function (elem) {
    // etc..
  });
});
```

* `select(cssSelector)` - is the same as `element` but includes a helper `selectOption(optionValue)` to select an option by value from your select elements. e.g: `examplePage.aSelect.selectOption(3);`

* `link(linkText)` - is used to find links by full or partial link text.

* `component(yourComponent, rootNode)` - Attaches a component you have defined to your page. Please see [components](#components).

There are some additional helper methods you can use:

* `title(handler)` - To get the page title. e.g:
```javascript
examplePage.title(function (t) {
  console.log(t);
});
```

* `waitFor(fn, timeout)` - Exposes selenium's `driver.wait`, to explicitly wait for a specific condition to be true. e.g:
```javascript
search: { value: function (query) {
    var _this = this;
    this.waitFor(function () {
      return _this.aTxtInput.isDisplayed();
    }, 5000);
    this.aTxtInput.sendKeys(query);
} }
```

* `alert()` - Attempts to switch to the current alert dialog. e.g: `examplePage.alert.accept();`.

Components are the same and have access to the same element methods, but not the page specific ones: `visit()`, `title()`, `alert()` & `component()`.
Please see the official [selenium webdriver](https://code.google.com/p/selenium/wiki/WebDriverJs) documentation for further information on working with elements.

### Session reference

Moonraker uses a session object to group functions related to the current test session and can be used in your step definitions etc:
```javascript
var session = require('moonraker').session;
session.resizeWindow(320, 480);
```

* `execute(fn)` - Adds any function to webdriver's control flow. Please see [control flows](https://code.google.com/p/selenium/wiki/WebDriverJs#Control_Flows).
* `resizeWindow(x, y)` - Resizes the browser window. By default its maximized.
* `refresh()` - Refreshes the current page.
* `saveScreenshot(filename)` - Saves a screenshot to `/yourResultsDir/screenshots/filename`. This is called automatically on test failure.
* `deleteAllCookies()` - Deletes all cookies.
* `addCookie(name, value, optDomain, optPath, optIsSecure)` - Adds a cookie.
* `getCookie(name)` - Gets a cookie by name.
* `currentUrl(handler)` - Gets the current url as a parsed [url](http://nodejs.org/api/url.html) object. e.g:
```javascript
session.currentUrl(function (url) {
  console.log(url);
});
```
* `savePerfLog(filename)` - Saves the driver performance logs to `/yourResultsDir/perf_logs/filename`. This has been tested with Chrome to import logs into a local instance of [webpagetest](http://www.webpagetest.org/) to generate performance waterfall charts etc.

### TODO

* Further element helpers - integrating the new [until](https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/CHANGES.md#v2440) module.
* Further example features, steps & pages.
