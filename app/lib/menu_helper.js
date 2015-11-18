'use strict';

var app = require('app');
var Menu = require('menu');
var BrowserWindow = require('browser-window');

var menu;

module.exports.setMenu = function (mainWindow, devMenu) {
    var menuTemplate = [
        {
            label: "Application",
            submenu: [
                { label: "About Opbeat", selector: "orderFrontStandardAboutPanel:" },
                { type: "separator" },
                { label: 'Hide Opbeat', selector: 'hide:', accelerator: 'Command+H' },
                { label: "Quit", accelerator: "CmdOrCtrl+Q", click: function() { app.quit(); }}
            ]
        },
        {
            label: "Edit",
            submenu: [
                { label: "Select All", accelerator: "Command+A", selector: "selectAll:"},
                { label: "Cut", accelerator: "Command+X", selector: "cut:" },
                { label: "Copy", accelerator: "Command+C", selector: "copy:" },
                { label: "Paste", accelerator: "Command+V", selector: "paste:" }
            ]
        },
        {
            label: "View",
            submenu: [
                { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: function () {
                    BrowserWindow.getFocusedWindow().reload();
                }}
            ]
        },
        {
            label: 'Window',
            submenu: [
                { label: 'Minimize', accelerator: 'Command+M', selector: 'performMiniaturize:'},
                { label: 'Close', accelerator: 'Command+W', selector: 'hide:'},
                { type: 'separator' },
                { label: 'Bring All to Front', selector: 'arrangeInFront:'}
            ]
        }
    ];

    var devMenuTemplate = {
        label: 'Development',
        submenu: [{
            label: 'Toggle DevTools',
            accelerator: 'Alt+CmdOrCtrl+I',
            click: function () {
                BrowserWindow.getFocusedWindow().toggleDevTools();
            }
        }]
    };

    if(devMenu) {
        menuTemplate.push(devMenuTemplate)
    }

    menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu);
};
