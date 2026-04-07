# Karma Local WebDriver Launcher - Agent Guide

## Overview

`karma-local-wd-launcher` is a Karma plugin that launches local browsers
(Chrome, Firefox, Edge, Opera, Safari) via WebDriver. It auto-downloads the
appropriate driver binaries using `webdriver-installer` and caches them in
`~/.webdriver-installer-cache`.  Safari support is Mac-only.

This plugin was created to support local browser testing for
[Shaka Player](https://github.com/shaka-project/shaka-player), and changes are
typically verified in that context.

The entire implementation lives in a single file: `index.js`.

## Attribution

Read [AGENT-ATTRIBUTION.md](AGENT-ATTRIBUTION.md) for attribution details.

## Setup

```sh
npm ci
```

No build step required. The package has no compilation, transpilation, or code
generation.


## Workflow

There is currently no linter or automated test suite. Both are planned for a
future update.

To verify a change, test it manually in the context of
[Shaka Player](https://github.com/shaka-project/shaka-player) by installing
your local copy of this package there:

```sh
# From the Shaka Player repo
npm install --save-dev /path/to/karma-local-wd-launcher
```

Then run Shaka Player's browser tests as usual.


## Code Style & Gotchas

**No ES6 class syntax for launchers.** Karma does not use `new` to construct
launcher objects, so launcher classes must use the old function-constructor
style. See the existing `LocalWebDriverBase` and `generateSubclass` patterns in
`index.js`.
