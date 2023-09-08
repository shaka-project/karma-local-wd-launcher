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
const which = require('which');
const _ = require('lodash');

const {installWebDrivers} = require('webdriver-installer');

const DRIVER_CACHE = path.join(os.homedir(), '.webdriver-installer-cache');
fs.mkdirSync(DRIVER_CACHE, {recursive: true});

// Delay on startup to allow the WebDriver server to start.
const WEBDRIVER_STARTUP_DELAY_SECONDS = 2;

// If it takes longer than this to close our WebDriver session, give up.
const CLOSE_WEBDRIVER_SESSION_TIMEOUT_SECONDS = 5;

let driversInstalledPromise = null;

// Map nodejs OS names to Selenium platform names.
const PLATFORM_MAP = {
  'darwin': 'Mac',
  'win32': 'Windows',
  'linux': 'Linux',
};

function mergeOptions(base, custom) {
  // _.mergeWith modifies the first argument, so clone the base structure first.
  const output = _.cloneDeep(base);
  return _.mergeWith(output, custom,
      // Concatenate arrays instead of overwriting them.
      (objValue, srcValue) => {
        if (Array.isArray(objValue)) {
          return objValue.concat(srcValue);
        }
      });
}

// Subclasses must define these static members:
//  - BROWSER_NAME: browser name as presented to WebDriver
//  - LAUNCHER_NAME: launcher name as presented to Karma
//  - EXTRA_WEBDRIVER_SPECS: an object containing any extra WebDriver specs
//  - getDriverArgs(port): take port as string, return driver command arguments
const LocalWebDriverBase = function(baseBrowserDecorator, args, logger) {
  baseBrowserDecorator(this);

  this.name = `${this.constructor.LAUNCHER_NAME} via WebDriver`;
  const log = logger.create(this.name);

  this.browserName = this.constructor.BROWSER_NAME;

  const port = Math.floor((Math.random() * 1000)) + 4000;

  // Called by the base class to get arguments to pass to the driver command.
  this._getOptions = () => this.constructor.getDriverArgs(port.toString());

  const config = {
    protocol: 'http:',
    hostname: '127.0.0.1',
    port,
    pathname: '/'
  };

  log.debug('config:', JSON.stringify(config));

  const extraSpecs = mergeOptions(
      this.constructor.EXTRA_WEBDRIVER_SPECS,
      args.config);
  log.debug('extraSpecs:', extraSpecs);

  // These names ("browser" and "spec") are needed for compatibility with
  // karma-webdriver-launcher.
  this.browser = wd.remote(config);
  this.spec = {
    browserName: this.browserName.toLowerCase(),
    platform: PLATFORM_MAP[os.platform()],
    // This is necessary for safaridriver:
    allowW3C: true,
    // This allows extra configuration for headless variants:
    ...extraSpecs,
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
    await delay(WEBDRIVER_STARTUP_DELAY_SECONDS);

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

  this.forceKillOperation_ = null;

  this.forceKill = async () => {
    // Don't nest force-kill operations.  If forceKill() was already called,
    // just return the same Promise again.
    if (this.state == 'BEING_FORCE_KILLED') {
      return this.forceKillOperation_;
    }

    this.state = 'BEING_FORCE_KILLED';
    this.forceKillOperation_ = this.stopWebdriver_();
    await this.forceKillOperation_;
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
      // If it takes too long to close the session, give up and move on.
      await Promise.race([
        delay(CLOSE_WEBDRIVER_SESSION_TIMEOUT_SECONDS),
        new Promise(resolve => this.browser.quit(resolve)),
      ]);
    }

    // Now that the driver connection and browser are closed (or have timed
    // out), emit the signal that shuts down the driver executable.
    await this.emitAsync('kill');

    this.state = 'FINISHED';
  };
}

async function delay(seconds) {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

// Generate a subclass of LocalWebDriverBase and return it.
function generateSubclass(
    browserName, launcherName, driverCommand, getDriverArgs,
    extraWebDriverSpecs={}) {
  if (driverCommand[0] == '/') {
    // Absolute path.  Keep it.
  } else {
    // File name.  Assume it will be found in our driver cache.
    driverCommand = path.join(DRIVER_CACHE, driverCommand);
  }

  // Karma will not use "new" to construct our class, so it can't be a true ES6
  // class.  Use the old function syntax instead.
  const subclass = function(baseBrowserDecorator, args, logger) {
    LocalWebDriverBase.call(this, baseBrowserDecorator, args, logger);
  };

  // These are needed by our base class, LocalWebDriverBase.
  subclass.BROWSER_NAME = browserName;
  subclass.LAUNCHER_NAME = launcherName;
  subclass.EXTRA_WEBDRIVER_SPECS = extraWebDriverSpecs;
  subclass.getDriverArgs = getDriverArgs;

  // These are needed by Karma's base class for command-based launchers, and
  // will also facilitate auto-detection of available browsers by Shaka Player:
  const anyPathSeparator = /[\/\\]/;  // Windows (backslash) or POSIX (slash)
  const driverCommandName = driverCommand.split(anyPathSeparator).pop();
  subclass.prototype.ENV_CMD =
      driverCommandName.toUpperCase().replace('-', '_') + '_PATH';
  subclass.prototype.DEFAULT_CMD = {
    linux: driverCommand,
    darwin: driverCommand,
    win32: driverCommand + '.exe',
  };

  // This configures Karma's dependency injection system:
  subclass.$inject = ['baseBrowserDecorator', 'args', 'logger'];

  return subclass;
}

function generateSafariDriver(name, device = 'mac', simulator = false) {
  const config = device == 'mac' ? {} : {
    platformName: 'iOS',
    'safari:deviceType': device,
    'safari:useSimulator': simulator,
  };
  return generateSubclass('Safari', name,
      '/usr/bin/safaridriver',
      (port) => ['--port=' + port],
      config);
}

const LocalWebDriverChrome = generateSubclass(
    'Chrome', 'Chrome',
    'chromedriver',
    (port) => ['--port=' + port]);

const LocalWebDriverChromeHeadless = generateSubclass(
    'Chrome', 'ChromeHeadless',
    'chromedriver',
    (port) => ['--port=' + port],
    {
      'goog:chromeOptions': {
        args: [
          '--headless',
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
        ],
      },
    });

// TODO: Add Chrome on android?

// If a binary is found with the name "microsoft-edge" in the PATH, specify
// that explicitly.  This works around the following edgedriver bug:
// https://github.com/MicrosoftEdge/EdgeWebDriver/issues/102#issuecomment-1710724173
const edgeOptions = {};
const edgeBinary = which.sync('microsoft-edge', {nothrow: true});
if (edgeBinary) {
  edgeOptions['ms:edgeOptions'] = {
    binary: edgeBinary,
  };
}

const LocalWebDriverEdge = generateSubclass(
    'MSEdge', 'MSEdge',
    'msedgedriver',
    (port) => ['--port=' + port],
    edgeOptions);

const LocalWebDriverEdgeHeadless = generateSubclass(
    'MSEdge', 'MSEdgeHeadless',
    'msedgedriver',
    (port) => ['--port=' + port],
    mergeOptions(edgeOptions, {
      'ms:edgeOptions': {
        args: [
          '--headless',
          '--disable-gpu',
        ],
      },
    }));

const LocalWebDriverFirefox = generateSubclass(
    'Firefox', 'Firefox',
    'geckodriver',
    (port) => ['-p', port],
    {
      'moz:firefoxOptions': {
        prefs: {
          'media.eme.enabled': true,
          'media.gmp-manager.updateEnabled': true,
        },
      },
    });

const LocalWebDriverFirefoxHeadless = generateSubclass(
    'Firefox', 'FirefoxHeadless',
    'geckodriver',
    (port) => ['-p', port],
    {
      'moz:firefoxOptions': {
        prefs: {
          'media.eme.enabled': true,
          'media.gmp-manager.updateEnabled': true,
        },
        args: [
          '-headless',
        ],
      },
    });

const LocalWebDriverSafari = generateSafariDriver('Safari');

const LocalWebDriverSafariIOS = generateSafariDriver('SafariIOS', 'iPhone');
const LocalWebDriverSafariIOSSim =
    generateSafariDriver('SafariIOSSim', 'iPhone', true);
const LocalWebDriverSafariIPadOS =
    generateSafariDriver('SafariIPadOS', 'iPad');
const LocalWebDriverSafariIPadOSSim =
    generateSafariDriver('SafariIPadOSSim', 'iPad', true);

const LocalWebDriverSafariTP = generateSubclass(
    'Safari Technology Preview', 'Safari Technology Preview',
    '/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver',
    (port) => ['-p', port]);

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
  module.exports['launcher:SafariIOS'] = ['type', LocalWebDriverSafariIOS];
  module.exports['launcher:SafariIOSSim'] =
      ['type', LocalWebDriverSafariIOSSim];
  module.exports['launcher:SafariIPadOS'] =
      ['type', LocalWebDriverSafariIPadOS];
  module.exports['launcher:SafariIPadOSSim'] =
      ['type', LocalWebDriverSafariIPadOSSim];
  module.exports['launcher:SafariTP'] = ['type', LocalWebDriverSafariTP];
}
