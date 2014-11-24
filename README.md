![Logo](https://github.com/auchenberg/chrome-devtools-app/raw/master/app/icon/logo.png)

Chrome DevTools App.
===================

Chrome DevTools packaged as an app via [node-webkit](https://github.com/rogerwang/node-webkit). 

This project is an exploration of how much work it would take to seperate Chrome DevTools from Chrome itself and still deliver a great user experience.

## How to get started

1. Download and start [Chrome DevTools.app](https://github.com/auchenberg/chrome-devtools-app/raw/master/build/Chrome%20DevTools/osx/Chrome%20DevTools.app.zip).
2. Start an instance of Chrome with remote debugging enabled
3. Click "discover targets"
4. Locate target, and click "connect"
5. Bam. There go you.

### How to start this app from source?
Run ``npm start`` and make sure you have [node-webkit](https://github.com/rogerwang/node-webkit) installed.

### How to make a new release?
Run ``grunt nodewebkit``.



This project is highly experimental.
