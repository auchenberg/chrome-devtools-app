var getADBdevices = require('adb-devtools-devices');
var request = require('request');

function ADBDeviceBrowser(targetsCollection) {
    this.targets = targetsCollection;
}

ADBDeviceBrowser.prototype.getDeviceTargets = function(device) {

    request({
        url: device.url + '/json',
        json: true
    }, function(err, response, targets) {

        targets.forEach(function(target) {

            var target = {
                group: device.device.properties['ro.product.display'] + ' (' + device.device.properties['ro.product.manufacturer'] + ' ' + device.device.properties['ro.product.model'] + ')',
                id: target.id,
                title: target.title,
                description: target.description,
                type: target.type,
                url: target.url,
                thumbnailUrl: target.thumbnailUrl,
                faviconUrl: target.faviconUrl,
                devtoolsFrontendUrl:target.devtoolsFrontendUrl,
                webSocketDebuggerUrl: target.webSocketDebuggerUrl
            };

            this.targets.add(target.id, target);

        }.bind(this));

    }.bind(this));

}

ADBDeviceBrowser.prototype.discover = function(service) {

    var self = this;

    getADBdevices().then(function(devices) {

        devices.forEach(function(device) {
            self.getDeviceTargets(device);
        });

    }).catch(function(err) {
        console.error(err);
    });

};

module.exports = ADBDeviceBrowser;