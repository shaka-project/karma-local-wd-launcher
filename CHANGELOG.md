# Changelog

## [1.6.3](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.6.2...v1.6.3) (2023-08-17)


### Bug Fixes

* Update webdriver-installer to fix Chromedriver &gt;= 115, fix M1 mac ([#55](https://github.com/shaka-project/karma-local-wd-launcher/issues/55)) ([7fc6bdc](https://github.com/shaka-project/karma-local-wd-launcher/commit/7fc6bdc45c89064268adf9919c3872c3cbe9a509))

## [1.6.2](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.6.1...v1.6.2) (2023-07-19)


### Bug Fixes

* Fix ChromeHeadless in Docker ([#51](https://github.com/shaka-project/karma-local-wd-launcher/issues/51)) ([a487e6d](https://github.com/shaka-project/karma-local-wd-launcher/commit/a487e6de37ebeac009e17619a5e48aa2e439e9d0))
* Fix clobbering of arguments in custom configurations ([#50](https://github.com/shaka-project/karma-local-wd-launcher/issues/50)) ([43ce270](https://github.com/shaka-project/karma-local-wd-launcher/commit/43ce27057eb0b86b5659f8eb49a50e1752d33d4a))
* Fix failure when drivers lag behind browser ([#53](https://github.com/shaka-project/karma-local-wd-launcher/issues/53)) ([14cf6c3](https://github.com/shaka-project/karma-local-wd-launcher/commit/14cf6c3ff1f4fcf62518590a246e355ed6c882de))

### [1.6.1](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.6.0...v1.6.1) (2022-04-21)


### Bug Fixes

* Fix hung launcher on shutdown of Safari ([#38](https://github.com/shaka-project/karma-local-wd-launcher/issues/38)) ([adc7898](https://github.com/shaka-project/karma-local-wd-launcher/commit/adc7898f50d7b57664b8f56734ec9730228e31a9)), closes [#24](https://github.com/shaka-project/karma-local-wd-launcher/issues/24)
* Fix missing lodash dependency ([#39](https://github.com/shaka-project/karma-local-wd-launcher/issues/39)) ([cc3f4c0](https://github.com/shaka-project/karma-local-wd-launcher/commit/cc3f4c022f0e1060715674c8fb19de208cccfd8e))

## [1.6.0](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.5.0...v1.6.0) (2022-03-23)


### Features

* Customize WebDriver config in custom launcher ([#35](https://github.com/shaka-project/karma-local-wd-launcher/issues/35)) ([c8fe569](https://github.com/shaka-project/karma-local-wd-launcher/commit/c8fe5696c87b8166c802945c3f2dec6ee67b5cee))

## [1.5.0](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.4.3...v1.5.0) (2022-03-10)


### Features

* Add Safari Technology Preview, iOS and iPadOS with simulators ([#33](https://github.com/shaka-project/karma-local-wd-launcher/issues/33)) ([3af8414](https://github.com/shaka-project/karma-local-wd-launcher/commit/3af8414ae37f93751b2090a98801f75b153d95e0))

### [1.4.3](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.4.2...v1.4.3) (2022-02-28)


### Bug Fixes

* Fix compatibility, browser launcher detection in shaka-player ([#29](https://github.com/shaka-project/karma-local-wd-launcher/issues/29)) ([9783318](https://github.com/shaka-project/karma-local-wd-launcher/commit/978331821148bcf25e1be7c60ca16460ac40eeeb)), closes [#23](https://github.com/shaka-project/karma-local-wd-launcher/issues/23)

### [1.4.2](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.4.1...v1.4.2) (2022-02-18)


### Bug Fixes

* Fix unlinking existing binaries ([#25](https://github.com/shaka-project/karma-local-wd-launcher/issues/25)) ([cd8a561](https://github.com/shaka-project/karma-local-wd-launcher/commit/cd8a56173ba6e0c42d6c61eb38ea7d35848b7c3e))

### [1.4.1](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.4.0...v1.4.1) (2022-02-11)


### Bug Fixes

* **deps:** Choose platform-specific msedgedriver version ([#19](https://github.com/shaka-project/karma-local-wd-launcher/issues/19)) ([5e78a49](https://github.com/shaka-project/karma-local-wd-launcher/commit/5e78a490a8742a7c479452c0a77304b1d290a767))

## [1.4.0](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.3.1...v1.4.0) (2022-02-10)


### Features

* Support ChromeHeadless, FirefoxHeadless and EdgeHeadless ([#13](https://github.com/shaka-project/karma-local-wd-launcher/issues/13)) ([b182d2f](https://github.com/shaka-project/karma-local-wd-launcher/commit/b182d2f0c480a623e176d3c4d3c55ca152bdc9b7)), closes [#12](https://github.com/shaka-project/karma-local-wd-launcher/issues/12)

### [1.3.1](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.3.0...v1.3.1) (2022-02-03)


### Bug Fixes

* Make Windows browser version queries more robust ([651c24c](https://github.com/shaka-project/karma-local-wd-launcher/commit/651c24ce66964ec395ced0166e73c18d22d588f3))

## [1.3.0](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.2.5...v1.3.0) (2022-02-03)


### Features

* Add MS Edge support on Linux and Mac ([97e8f2e](https://github.com/shaka-project/karma-local-wd-launcher/commit/97e8f2e078920e523138fe67bfd0e6efe199dd17))
* Log the contents of the driver cache on failure to run the driver ([0c2f1e3](https://github.com/shaka-project/karma-local-wd-launcher/commit/0c2f1e35bdde6311c60320b1a707c23f7ec70e22))


### Bug Fixes

* Fix GitHub API rate limit issues getting geckodriver release ([97e8f2e](https://github.com/shaka-project/karma-local-wd-launcher/commit/97e8f2e078920e523138fe67bfd0e6efe199dd17))

### [1.2.5](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.2.4...v1.2.5) (2022-02-03)


### Bug Fixes

* Append .exe to driver names on Windows ([c6e512f](https://github.com/shaka-project/karma-local-wd-launcher/commit/c6e512f1ed80760c7c70eb0f97234857bce70f7a))
* Fix env variable corruption ([57cd5da](https://github.com/shaka-project/karma-local-wd-launcher/commit/57cd5da4c42274abfb95078420ed92e6003eeebf))

### [1.2.4](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.2.3...v1.2.4) (2022-02-03)


### Bug Fixes

* Add small startup delay to fix connection failures ([03918e3](https://github.com/shaka-project/karma-local-wd-launcher/commit/03918e374b89769ba769f5bc14fe440b3f05a494))
* Fix Safari startup failures ([73892e9](https://github.com/shaka-project/karma-local-wd-launcher/commit/73892e97db05545f877a5c91bdfc21f3f65c72a7))

### [1.2.3](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.2.2...v1.2.3) (2022-02-03)


### Bug Fixes

* **ci:** Use an alternate upload action in release workflow ([16cfaed](https://github.com/shaka-project/karma-local-wd-launcher/commit/16cfaeda550d7a0aa12b2a1f397efb7e3d63cec9))

### [1.2.2](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.2.1...v1.2.2) (2022-02-03)

* Dummy release to test CI changes ([f1fe277](https://github.com/shaka-project/karma-local-wd-launcher/commit/f1fe277a3ce07024b570475067922683b02e6fb8))


### [1.2.1](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.2.0...v1.2.1) (2022-02-03)


### Bug Fixes

* Fix browser name to MSEdge to match Selenium grid ([e72c8ed](https://github.com/shaka-project/karma-local-wd-launcher/commit/e72c8ed08518214b256a0d325c62f1ef2c38dce8))

## [1.2.0](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.1.1...v1.2.0) (2022-02-03)


### Features

* Add MS Edge support ([08a225e](https://github.com/shaka-project/karma-local-wd-launcher/commit/08a225ea779f40bc03fe776e87f9bb6a2b110b09))

## [1.1.1](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.1.0...v1.1.1) (2022-02-02)


### Bug Fixes

* Fix operation on Windows ([8331708](https://github.com/shaka-project/karma-local-wd-launcher/commit/8331708831a4814d308ee379d9528f5c6eb97050))



## [1.1.0](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.0.2...v1.1.0) (2022-01-31)


### Features

* Automatically fetch and install drivers ([1e7a0ca](https://github.com/shaka-project/karma-local-wd-launcher/commit/1e7a0ca04640f5ef3ea50ef9fa4ecaddb50a9df9))



## [1.0.2](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.0.1...v1.0.2) (2022-01-31)


### Bug Fixes

* Fix chromedriver arguments ([c0eb120](https://github.com/shaka-project/karma-local-wd-launcher/commit/c0eb120b89d4bb30ce246e1b4bb8420e809a5676))
* Fix WebDriver shutdown ([938bb2a](https://github.com/shaka-project/karma-local-wd-launcher/commit/938bb2aa384822c1c62d2ac098f304ecdd705b28))



## [1.0.1](https://github.com/shaka-project/karma-local-wd-launcher/compare/v1.0.0...v1.0.1) (2022-01-25)


### Bug Fixes

* Fix driver path env vars, driver documentation ([5f80282](https://github.com/shaka-project/karma-local-wd-launcher/commit/5f80282b0b7a433250d8a8dc6a6a3e7a044f4842))



## [1.0.0](https://github.com/shaka-project/karma-local-wd-launcher/commit/efe2a0a) (2022-01-25)


### Features

* Support for Chrome, Firefox, and Safari ([efe2a0a](https://github.com/shaka-project/karma-local-wd-launcher/commit/efe2a0a2139fe9030c27f7ac5c153682c71a1cca))
