var mdns = require('mdns');

function RemoteDebugBrowser(targetsCollection) {

  this.targets = targetsCollection;

  this.browser = mdns.createBrowser(mdns.tcp('remotedebug'));
  this.browser.on('serviceUp', this.onServiceUp.bind(this));
  this.browser.on('serviceDown', this.onServiceDown.bind(this));

  this.browser.start();

}

RemoteDebugBrowser.prototype.onServiceDown = function(service) {

  console.log('service.host', service.host);
  console.log('service.port', service.port);

  var serviceId = service.type.toString();
  console.log('serviceId', serviceId);  

  // if(!serviceId) {
  //   return;
  // }

  // this.targets.remove(serviceId);

};

RemoteDebugBrowser.prototype.onServiceUp = function(service) {

  console.log('service.host', service.host);
  console.log('service.port', service.port)

  var target = {
    id: service.txtRecord.id,
    title: service.txtRecord.title,
    description: service.txtRecord.description,
    type: service.txtRecord.type,
    url: service.txtRecord.url,
    thumbnailUrl: service.txtRecord.thumbnailUrl,
    faviconUrl: service.txtRecord.faviconUrl,
    devtoolsFrontendUrl: service.txtRecord.devtoolsFrontendUrl,
    webSocketDebuggerUrl: service.txtRecord.webSocketDebuggerUrl
  };

  this.targets.add(target.id, target);

};

module.exports = RemoteDebugBrowser;
