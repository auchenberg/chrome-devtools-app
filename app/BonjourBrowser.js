var mdns = require('mdns');

function BonjourBrowser(targetsCollection) {

  this.targets = targetsCollection;

  this.browser = mdns.createBrowser(mdns.tcp('remotedebug'));
  this.browser.on('serviceUp', this.onServiceUp.bind(this));
  this.browser.on('serviceDown', this.onServiceDown.bind(this));

  this.browser.start();

}

BonjourBrowser.prototype.onServiceDown = function(service) {

  console.log('service', service.toString);

  // var serviceId = service.toString();
  // if(!serviceId) {
  //   return;
  // }

  // this.targets.remove(serviceId);

};

BonjourBrowser.prototype.onServiceUp = function(service) {

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

module.exports = BonjourBrowser;
