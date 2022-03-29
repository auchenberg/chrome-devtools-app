# Update on Chrome DevTools App.

Chrome DevTools App is now superseeded by https://inspect.dev/ – a new developer tool for macOS and Windows to inspect and debug your web apps and websites in Safari and WebViews on iOS devices 🤯🎉🔥 

<p><strong>Maintenance status:</strong> Chrome DevTools App. is not proactively maintained or extended.

<details><summary>Original readme</summary>
  
![Icon](https://github.com/auchenberg/chrome-devtools-app/raw/master/readme/icon.png)

Chrome DevTools App
===================

## Discontinued
This project is Discontinued. See https://github.com/auchenberg/chrome-devtools-app/issues/48

[![Join the chat at https://gitter.im/auchenberg/chrome-devtools-app](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/auchenberg/chrome-devtools-app?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Chrome DevTools packaged as an app using [electron-prebuilt](https://github.com/mafintosh/electron-prebuilt). 

This project is an exploration of how much work it would take to separate Chrome DevTools from Chrome itself and to explore what separation from the browser  would bring to the table in terms of new functionality, etc.

I've written an article about this project, where I go in detail, and provide a few perspectives on what this project could evolve into. https://kenneth.io/blog/2014/12/28/taking-chrome-devtools-outside-the-browser/.

![Intro](https://raw.githubusercontent.com/auchenberg/chrome-devtools-app/master/readme/app-intro.png)
![Tools](https://raw.githubusercontent.com/auchenberg/chrome-devtools-app/master/readme/app-inspector.png)

## Installation

1. Go to the [releases page](https://github.com/auchenberg/chrome-devtools-app/releases), and download the latest DMG installer (Mac only, for now)
2. Drag Chrome DevTools App to your `applications` folder
3. Start an instance of Chrome with [remote debugging enabled](https://developer.chrome.com/devtools/docs/debugger-protocol#remote)
4. Start Chrome DevTools App
5. Wait a second or click the refresh button.
6. Targets should show up. Click "Go" next to your target.
7. Bam. There go you.

## Development

#### How to get started from source?
1. Run `npm install`
2. Run `npm start`

#### How to start this app from source?
1. Run `npm install`
2. Run `npm install bower-cli -g`
3. Run `npm start`

#### How to start a debug version of this app?
Run `npm start`

## Releases

#### How to make a new build?
Run `npm run release`

---

This project is highly experimental.
