// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

var app = require('app');
var BrowserWindow = require('browser-window');
var env = require('./vendor/electron_boilerplate/env_config');
var menuHelper = require('./lib/menu_helper');
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');

var mainWindow, devMenu;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
    width: 800,
    height: 600
});

app.on('ready', function () {

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height
    });

    if (mainWindowState.isMaximized) {
        mainWindow.maximize();
    }

    mainWindow.loadUrl('file://' + __dirname + '/app.html');

    if (env.name !== 'production') {
        mainWindow.openDevTools({detach: true});
        devMenu = true;
    }

    menuHelper.setMenu(mainWindow, devMenu);

    mainWindow.on('close', function () {
        mainWindowState.saveState(mainWindow);
    });

    // var protocol = require('protocol');
    // protocol.registerProtocol('devtools', function(request) {
    //   var url = request.url
    //
    //   console.log('url', url)
    //
    //   return new protocol.RequestStringJob({
    //     data: ''
    //   })
    // });
});

app.on('window-all-closed', function () {
    app.quit();
});
