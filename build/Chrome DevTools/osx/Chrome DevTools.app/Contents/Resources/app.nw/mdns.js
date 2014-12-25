var mdns = require('mdns');

var mdnsBrowser = mdns.createBrowser(mdns.tcp('remotedebug'));

mdnsBrowser.on('serviceUp', function(service) {

  if(targets[service.name]) {
    return;
  }

  targets[service.name] = {
    'addresses': service.addresses, 
    'port': service.port
  };

  var target = {
    title: service.txtRecord.title,
    description: service.txtRecord.description,
    type: service.txtRecord.type,
    devtoolsFrontendUrl: '/devtools/inspector.html?ws=' + service.txtRecord.url,
    url: service.txtRecord.url
  }

  $scope.targets.push(target);
  $scope.$apply();

});

mdnsBrowser.on('serviceDown', function(service) {
  
  if(!targets[service.name]) {
    return;
  }

  delete targets[service.name];

});

console.log('listening for RemoteDebug devices on the net')
mdnsBrowser.start();    