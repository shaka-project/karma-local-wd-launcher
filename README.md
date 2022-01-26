# karma-local-wd-launcher

Karma Local WebDriver Launcher

Launches local web browsers using WebDriver, to enable screenshots and other
advanced tests to be executed in-browser.  If you don't need WebDriver to
enable some test scenario in Karma, you can just use typical local browser
launchers.

Supports Chrome, Firefox, and Safari.


## Installation

```sh
npm install --save-dev karma-local-wd-launcher
```


## Drivers

This launcher assumes that drivers such as `chromedriver`, `geckodriver`, and
`safaridriver` (Mac only) are already installed, executable, and in your `PATH`.

Alternately, you may use the environment variables `CHROMEDRIVER_PATH`,
`GECKODRIVER_PATH`, or `SAFARIDRIVER_PATH` to indicate where these drivers are
installed.


## Configuration

```js
// karma.conf.js
module.exports = (config) => {
  config.set({
    browsers: ['Chrome', 'Firefox', 'Safari']
  });
};
```

You can give Karma's command-line interface a list of browsers, too:

```sh
karma start --browsers Chrome Firefox Safari
```
