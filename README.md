# karma-local-wd-launcher

Karma Local WebDriver Launcher

Launches local web browsers using WebDriver, to enable screenshots and other
advanced tests to be executed in-browser.  If you don't need WebDriver to
enable some test scenario in Karma, you can just use typical local browser
launchers.

Supports Chrome, Firefox, Edge, and Safari.


## Installation

```sh
npm install --save-dev karma-local-wd-launcher
```


## Drivers

This launcher will use the
[`webdriver-installer`](https://www.npmjs.com/package/webdriver-installer)
module to automatically download and install driver binaries for your local
browsers.  These will be cached in a folder called `.webdriver-installer-cache`
in your home directory.

Alternately, you may use the environment variables `CHROMEDRIVER_PATH`,
`GECKODRIVER_PATH`, or `SAFARIDRIVER_PATH` to indicate where these drivers are
already installed.


## Configuration

```js
// karma.conf.js
module.exports = (config) => {
  config.set({
    plugins: ['karma-local-wd-launcher'],
    browsers: ['Chrome', 'Firefox', 'Edge', 'Safari'],
  });
};
```

You can give Karma's command-line interface a list of browsers, too:

```sh
karma start --browsers Chrome Firefox Safari
```

There is a possibilty to create custom launcher based on existing ones, i.e. to
pass additional configuration options to specific WebDriver.

```js
// karma.conf.js
module.exports = (config) => {
  config.set({
    customLaunchers: {
      'ChromeNoBackgroundSuspend': {
        base: 'Chrome',
        config: {
          'goog:chromeOptions': {
            args: [
              '--disable-background-media-suspend',
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
            ],
          },
        },
      },
    },
  });
};
```
