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

const fs = require('fs');
const os = require('os');
const path = require('path');
const wd = require('wd');

const {installWebDrivers} = require('webdriver-installer');

const DRIVER_CACHE = path.join(os.homedir(), '.webdriver-installer-cache');
fs.mkdirSync(DRIVER_CACHE, {recursive: true});

let driversInstalledPromise = null;

// Map nodejs OS names to Selenium platform names.
const PLATFORM_MAP = {
  'darwin': 'Mac',
  'win32': 'Windows',
  'linux': 'Linux',
};

const LocalWebDriverBase = function(
    browserName, name, driverCommand, argsFromPort, baseBrowserDecorator, logger) {
  baseBrowserDecorator(this);

  this.name = `${name} via WebDriver`;
  const log = logger.create(this.name);

  this.browserName = browserName;

  // An environment variable that can be used to override the command path.
  // Must be computed before the cache path is prepended to the driverCommand.
  this.ENV_CMD = driverCommand.toUpperCase().replace('-', '_') + '_PATH';

  if (driverCommand[0] == '/') {
    // Absolute path.  Keep it.
  } else {
    // File name.  Assume it's in our driver cache.
    driverCommand = path.join(DRIVER_CACHE, driverCommand);
  }

  log.debug(`Default driver command: ${driverCommand}`);

  // Checked by the base class to determine what command to run.
  this.DEFAULT_CMD = {
    linux: driverCommand,
    darwin: driverCommand,
    win32: driverCommand + '.exe',
  };

  const port = Math.floor((Math.random() * 1000)) + 4000;

  // Called by the base class to get arguments to pass to the driver command.
  this._getOptions = () => argsFromPort(port.toString());

  const config = {
    protocol: 'http:',
    hostname: '127.0.0.1',
    port,
    pathname: '/'
  };

  log.debug('config:', JSON.stringify(config));

  // These names ("browser" and "spec") are needed for compatibility with
  // karma-webdriver-launcher.
  this.browser = wd.remote(config);
  this.spec = {
    browserName: this.browserName.toLowerCase(),
    platform: PLATFORM_MAP[os.platform()],
    // This is necessary for safaridriver:
    allowW3C: true,
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

  this.on('start', async (url) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

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

  this.start = async (url) => {
    // If we haven't installed drivers yet in this session, start the
    // installation process now.
    if (!driversInstalledPromise) {
      // TODO: Tie logging for this to karma log settings.
      driversInstalledPromise =
          installWebDrivers(DRIVER_CACHE, /* logging= */ false);
    }

    // Wait for drivers to be installed for all local browsers.
    await driversInstalledPromise;

    previousUrl = url;
    originalStart.call(this, url);
  };

  const originalOnProcessExit = this._onProcessExit;
  this._onProcessExit = (code, signal, errorOutput) => {
    originalOnProcessExit.call(this, code, signal, errorOutput);

    if (code == -1 && errorOutput.includes('Can not find')) {
      // Failed to find the driver.  Is it in the cache?  Debug to help the
      // user find out what's wrong.
      try {
        const contents = fs.readdirSync(DRIVER_CACHE);
        log.error(
          `Failed to find driver for ${this.browserName}`);
        log.error(
          `${DRIVER_CACHE} contains:`, JSON.stringify(contents, null, '  '));
      } catch (error) {}
    }
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
      'Chrome', 'Chrome', 'chromedriver', (port) => ['--port=' + port],
      baseBrowserDecorator, logger);
};

const LocalWebDriverChromeHeadless = function(baseBrowserDecorator, logger) {
  LocalWebDriverBase.call(this,
      'Chrome', 'ChromeHeadless', 'chromedriver', (port) => ['--port=' + port],
      baseBrowserDecorator, logger);

  this.spec['goog:chromeOptions'] = {
    args: [
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
  };
};

// TODO: Add Chrome on android?

const LocalWebDriverEdge = function(baseBrowserDecorator, logger) {
  LocalWebDriverBase.call(this,
      'MSEdge', 'MSEdge', 'msedgedriver', (port) => ['--port=' + port],
      baseBrowserDecorator, logger);
};

const LocalWebDriverEdgeHeadless = function(baseBrowserDecorator, logger) {
  LocalWebDriverBase.call(this,
      'MSEdge', 'MSEdgeHeadless', 'msedgedriver', (port) => ['--port=' + port],
      baseBrowserDecorator, logger);

  this.spec['ms:edgeOptions'] = {
    args: [
      '--headless',
      '--disable-gpu',
    ],
  };
};

const LocalWebDriverFirefox = function(baseBrowserDecorator, logger) {
  LocalWebDriverBase.call(this,
      'Firefox', 'Firefox', 'geckodriver', (port) => ['-p', port],
      baseBrowserDecorator, logger);
};

const LocalWebDriverFirefoxHeadless = function(baseBrowserDecorator, logger) {
  LocalWebDriverBase.call(this,
      'Firefox', 'FirefoxHeadless', 'geckodriver', (port) => ['-p', port],
      baseBrowserDecorator, logger);

  this.spec['moz:firefoxOptions'] = {
    args: [
      '-headless',
    ],
  };
};

const LocalWebDriverSafari = function(baseBrowserDecorator, logger) {
  LocalWebDriverBase.call(this,
      'Safari', 'Safari', '/usr/bin/safaridriver', (port) => ['-p', port],
      baseBrowserDecorator, logger);
};

LocalWebDriverChrome.$inject = ['baseBrowserDecorator', 'logger'];
LocalWebDriverChromeHeadless.$inject = ['baseBrowserDecorator', 'logger'];
LocalWebDriverEdge.$inject = ['baseBrowserDecorator', 'logger'];
LocalWebDriverEdgeHeadless.$inject = ['baseBrowserDecorator', 'logger'];
LocalWebDriverFirefox.$inject = ['baseBrowserDecorator', 'logger'];
LocalWebDriverFirefoxHeadless.$inject = ['baseBrowserDecorator', 'logger'];
LocalWebDriverSafari.$inject = ['baseBrowserDecorator', 'logger'];

module.exports = {
  'launcher:Chrome': ['type', LocalWebDriverChrome],
  'launcher:ChromeHeadless': ['type', LocalWebDriverChromeHeadless],
  'launcher:Edge': ['type', LocalWebDriverEdge],
  'launcher:EdgeHeadless': ['type', LocalWebDriverEdgeHeadless],
  'launcher:Firefox': ['type', LocalWebDriverFirefox],
  'launcher:FirefoxHeadless': ['type', LocalWebDriverFirefoxHeadless],
};

// Safari is only supported on Mac.
if (os.platform() == 'darwin') {
  module.exports['launcher:Safari'] = ['type', LocalWebDriverSafari];
}
