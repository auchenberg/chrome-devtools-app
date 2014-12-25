![Logo](https://github.com/auchenberg/chrome-devtools-app/raw/master/app/icon/logo.png)

Chrome DevTools App.
===================

Chrome DevTools packaged as an app via [node-webkit](https://github.com/rogerwang/node-webkit). 

This project is an exploration of how much work it would take to seperate Chrome DevTools from Chrome itself and still deliver a great user experience.

![Intro](http://s3.kkloud.com.s3.amazonaws.com/gett/8mZhfS72/Chrome%20DevTools.png.client.x675.png)
![Tools](http://s3.kkloud.com.s3.amazonaws.com/gett/8mZhfS72/Chrome%20DevTools-1.png.client.x675.png)

## How to get started

1. Download and start [Chrome DevTools.app](https://github.com/auchenberg/chrome-devtools-app/raw/master/build/Chrome%20DevTools/osx/Chrome%20DevTools.app.zip).
2. Start an instance of Chrome with remote debugging enabled
3. Click "discover targets"
4. Locate target, and click "connect"
5. Bam. There go you.


### How to get started with the source?
1. Run ``npm install``
2. Run ``bower install``
3. Run ``grunt server`` 

### How to start this app from source?
Run ``grunt run`` and make sure you have [node-webkit](https://github.com/rogerwang/node-webkit) installed.

### How to start debug version of app in browser?
Run ``grunt server``

### How to make a new build?
Run ``grunt build``

This project is highly experimental.
