![Logo](https://github.com/auchenberg/chrome-devtools-app/raw/master/app/icon/logo.png)

Chrome DevTools App.
===================

Chrome DevTools packaged as an app via [node-webkit](https://github.com/rogerwang/node-webkit). 

This project is an exploration of how much work it would take to separate Chrome DevTools from Chrome itself and to explore what separation from the browser itself would bring to the table in terms of new functionality, etc.

I've written an article about this project, where I go in detail, and provide a few perspectives on what this project could evolve into. https://kenneth.io/blog/2014/12/28/taking-chrome-devtools-outside-the-browser/.

![Intro](https://raw.githubusercontent.com/auchenberg/chrome-devtools-app/master/readme/app-intro.png)
![Tools](https://raw.githubusercontent.com/auchenberg/chrome-devtools-app/master/readme/app-inspector.png)

## How to get started with a release

1. Download and start [Chrome DevTools.app](https://github.com/auchenberg/chrome-devtools-app/raw/master/build/Chrome%20DevTools/osx/Chrome-DevTools.app.zip)
2. Start an instance of Chrome with [remote debugging enabled](https://developer.chrome.com/devtools/docs/debugger-protocol#remote)
3. Wait a second or click the refresh button.
4. Targets should show up. Click "Go" next to your target.
5. Bam. There go you.

### How to get started from source?
1. Run ``npm install``
2. Run ``bower install``
3. Run ``grunt server``

---

### How to start this app from source?
1. Run ``npm install nodewebkit`` if you haven't already
2. Run ``grunt run``

### How to start a debug version of this app?
Run ``grunt runDebug``

---

### How to make a new build?
Run ``grunt build``

---

This project is highly experimental.
