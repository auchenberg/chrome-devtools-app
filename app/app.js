var TargetsCollection = require('./TargetsCollection');
var ADBDeviceBrowser = require('./ADBDeviceBrowser');

var app = angular.module('app', ['ngAnimate', 'ngMaterial', 'LocalStorageModule', 'ng.group']);

app.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('app');
});

app.filter('regex', function() {

    return function(input, field, regex) {
        var patt = new RegExp(regex);
        var out = [];

        if(input) {
            for (var i = 0; i < input.length; i++){
                if(patt.test(input[i][field])) {
                    out.push(input[i]);
                }
            }
        }

        return out;
    };
    
});

app.directive('devtools', function() {

    return {
        restrict: 'E',
        replace: true,
        template: '<div class="devtools-wrapper"><iframe src="{{src}}"></iframe></div>',
        scope: {
            'src': '@',
        },
        link: function ($scope, element, attr) {

        }
    }

});

app.controller('home', function ($scope, $http, $location, localStorageService, $timeout) {

    $scope.REDISCOVERY_DELAY = 500; // Half a second
    $scope.filter = '^page$';
    $scope.targetsFilterSelectedIndex = 1;
    $scope.devtoolsUrl = '';

    $scope.targets = new TargetsCollection();
    $scope.adbDeviceBrowser = new ADBDeviceBrowser($scope.targets);

    setupMenubars();

    $scope.connect = function(target) {

        if(!target.devtoolsFrontendUrl) {
            throw new Error("devtoolsFrontendUrl is missing");
        }

        var webSocketUrl = target.webSocketDebuggerUrl.replace(/(ws|wss)\:\/\//, '');

        $scope.currentTarget = target;
        $scope.devtoolsUrl = 'devtools/front_end/inspector.html?ws=' + webSocketUrl;
    }

    $scope.setTargetFilter = function(filter) {

        switch(filter) {
            case 'apps':
                $scope.filter = '^app$';
                $scope.targetsFilterSelectedIndex = 0;
                break;
            case 'pages':
                $scope.filter = '^page$';
                $scope.targetsFilterSelectedIndex = 1;
                break;
            case 'background_page':
                $scope.filter = '^background_page$';
                $scope.targetsFilterSelectedIndex = 2;
                break;
        }

        localStorageService.set('currentFilter', filter)

    }

    $scope.discover = function() {

        // $scope.targets.clear();

        // Local chrome devices
        $http.get('http://localhost:9222/json').success(function(data, status, headers, config) {
            data.forEach(function(item) {
                item.group = 'Chrome (desktop)';

                $scope.targets.add(item.id, item);
            });
        });

        // ADB / Android devices
        $scope.adbDeviceBrowser.discover();

    }

    $scope.showTargets = function() {
        $scope.devtoolsUrl = '';
    }

    $scope.startDiscoveryChecks = function rediscover(){
        $timeout(function(){
            $scope.discover()
            rediscover()
        }, $scope.REDISCOVERY_DELAY)
    }

    $scope.discover();
    $scope.startDiscoveryChecks()

    $scope.setTargetFilter(localStorageService.get('currentFilter') || 'pages')

});

// Privates

function setupMenubars() {

    var gui = require('nw.gui');
    var win = gui.Window.get();

    // Menu bars
    var nativeMenuBar = new gui.Menu({
        type: "menubar"
    });
    nativeMenuBar.createMacBuiltin('Chrome DevTools');
    win.menu = nativeMenuBar;

    var debugMenuBar = new gui.Menu();
    debugMenuBar.append(new gui.MenuItem({
        label: 'Toggle DevTools',
        click: function() {
            win.showDevTools();
        }
    }));

    nativeMenuBar.append(new gui.MenuItem({
        label: 'Debug',
        submenu: debugMenuBar
    }));

}