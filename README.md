## Moonraker.

To use this framework you need to add this to your package.json:
```
  "dependencies": {
    "private-repo": "git+ssh://git@github.com:LateRoomsGroup/moonraker.git"
  },
  "scripts": {
    "test": "node node_modules/moonraker/bin/moonraker.js"
  }
```
Once you have run `$ npm install` you will need a config.json in the root to setup the base_url, feature/step directory paths and browser instance etc:

```
{
  "baseUrl": "http://www.laterooms.com",
  "featuresDir": "tests/features",
  "stepsDir": "tests/steps",
  "threads": 1,

  "browser": {
    "browserName": "chrome",
    "chromeOptions": {
      "args": ["--test-type"]
    }
  }
}
```
You can copy the contents of `node_modules/moonraker/example_project` that comes with an example feature, step definitions, page objects and config.json. Run the tests with `$ npm test`.

Additional requirements:

Example running with Chrome... you will need Chrome installed in the default location and latest [chromedriver](http://chromedriver.storage.googleapis.com/index.html) downloaded and available on your path.

Increasing the number of threads in the config will enable parallel testing of features. Features will be divided across threads (browsers) to speed up the test run.

...
