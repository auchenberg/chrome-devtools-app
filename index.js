var BrowserWindow = require('browser-window')
var app = require('app')
var path = require('path');
var ipc = require('ipc')

var mainWindow = null

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit()
});

app.on('ready', function() {

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Chrome DevTools'
  })

  mainWindow.loadUrl('file://' + __dirname + '/app/index.html')

  mainWindow.on('closed', function() {
    mainWindow = null
  })

  var protocol = require('protocol');
  protocol.registerProtocol('devtools', function(request) {
    var url = request.url

    console.log('url', url)

    return new protocol.RequestStringJob({
      data: ''
    })
  });

})
