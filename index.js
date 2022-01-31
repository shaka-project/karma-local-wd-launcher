/*! @license
 * Karma Local WebDriver Launcher
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview
 *
 * Launches local web browsers using WebDriver, to enable screenshots and other
 * advanced tests to be executed in-browser.  If you don't need WebDriver to
 * enable some test scenario in Karma, you can just use typical local browser
 * launchers.
 *
 * Supports Chrome, Firefox, and Safari.
 */

const os = require('os');
const url = require('url');
const wd = require('wd');

// Map nodejs OS names to Selenium platform names.
const PLATFORM_MAP = {
  'darwin': 'Mac',
  'win32': 'Windows',
  'linux': 'Linux',
};

const LocalWebDriverBase = function(
    browserName, driverCommand, argsFromPort, baseBrowserDecorator, logger) {
  baseBrowserDecorator(this);

  this.browserName = browserName;

  this.DEFAULT_CMD = {
    linux: driverCommand,
    darwin: driverCommand,
    win32: driverCommand,
  };

  const port = Math.floor((Math.random() * 1000)) + 4000;

  // Called by the base class to get arguments to pass to the driver command.
  this._getOptions = () => argsFromPort(port.toString());

  this.ENV_CMD = driverCommand.toUpperCase() + '_PATH';

  const config = {
    protocol: 'http:',
    hostname: '127.0.0.1',
    port,
    pathname: '/'
  };

  const webDriver = url.format(config);
  this.name = `${this.browserName} via WebDriver at ` + webDriver;

  const log = logger.create(this.name);
  log.debug('config:', JSON.stringify(config));

  // These names ("browser" and "spec") are needed for compatibility with
  // karma-webdriver-launcher.
  this.browser = wd.remote(config);
  this.spec = {
    browserName: this.browserName.toLowerCase(),
    platform: PLATFORM_MAP[os.platform()],
  };

  this.browser.on('status', (info) => {
    log.debug('Status: ' + info);
  });

  this.browser.on('command', (eventType, command, response) => {
    log.debug('[command] ' + eventType + ' ' + command + ' ' + (response || ''));
  });

  this.browser.on('http', (meth, path, data) => {
    log.debug('[http] ' + meth + ' ' + path + ' ' + (data || ''));
  });

  this.on('start', (url) => {
    this.browser.init(this.spec, (error) => {
      if (error) {
        log.error(`Could not connect to ${this.browserName} WebDriver`);
        log.error(error);
      } else {
        log.debug(`Connected to ${this.browserName} WebDriver`);
        log.debug('Connecting to ' + url);
        this.browser.get(url);
      }
    });
  });

  // The base decorators will listen for the 'kill' event to close the process
  // for the driver.  Once that happens, we can no longer stop the webdriver
  // connection and close the open browser window.  There is no way to register
  // a listener ahead of the base class's, so to shut down the browser
  // properly, we need to reimplement all the methods that could trigger a
  // 'kill' event.
  this.kill = async () => {
    this.state = 'BEING_KILLED';
    await this.stopWebdriver_();
  };

  this.forceKill = async () => {
    this.state = 'BEING_FORCE_KILLED';
    await this.stopWebdriver_();
  };

  const originalStart = this.start;
  let previousUrl = null;

  this.start = (url) => {
    previousUrl = url;
    originalStart.call(this, url);
  };

  this.restart = async () => {
    if (this.state == 'BEING_FORCE_KILLED') {
      return;
    }

    this.state = 'RESTARTING';
    await this.stopWebdriver_();

    if (this.state != 'BEING_FORCE_KILLED') {
      log.debug(`Restarting ${this.name}`)
      this.start(previousUrl);
    }
  };

  this.stopWebdriver_ = async () => {
    if (this.browser) {
      await new Promise(resolve => this.browser.quit(resolve));
    }

    // Now that the driver connection and browser are closed, emit the signal
    // that shuts down the driver executable.
    await this.emitAsync('kill');

    this.state = 'FINISHED';
  };
}

const LocalWebDriverChrome = function(baseBrowserDecorator, logger) {
  LocalWebDriverBase.call(this,
      'Chrome', 'chromedriver', (port) => ['--port=' + port],
      baseBrowserDecorator, logger);
};

// TODO: Add Chrome on android?

const LocalWebDriverFirefox = function(baseBrowserDecorator, logger) {
  LocalWebDriverBase.call(this,
      'Firefox', 'geckodriver', (port) => ['-p', port],
      baseBrowserDecorator, logger);
};

const LocalWebDriverSafari = function(baseBrowserDecorator, logger) {
  LocalWebDriverBase.call(this,
      'Safari', '/usr/bin/safaridriver', (port) => ['-p', port],
      baseBrowserDecorator, logger);
};

// TODO: Add MS Edge

LocalWebDriverChrome.$inject = ['baseBrowserDecorator', 'logger'];
LocalWebDriverFirefox.$inject = ['baseBrowserDecorator', 'logger'];
LocalWebDriverSafari.$inject = ['baseBrowserDecorator', 'logger'];

module.exports = {
  'launcher:Chrome': ['type', LocalWebDriverChrome],
  'launcher:Firefox': ['type', LocalWebDriverFirefox],
};

// Safari is only supported on Mac.
if (os.platform() == 'darwin') {
  module.exports['launcher:Safari'] = ['type', LocalWebDriverSafari];
}
