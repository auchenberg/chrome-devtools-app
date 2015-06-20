var ipc = require('ipc')

var TargetsCollection = require('./TargetsCollection');
var app = angular.module('app', ['ngAnimate', 'ngMaterial', 'LocalStorageModule']);
var discoverUrl = 'http://localhost:9222/json'

app.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('pink');
});

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

app.controller('home', function ($scope, $http, $location, localStorageService, $timeout, $mdDialog, $window) {

  $scope.REDISCOVERY_DELAY = 500; // Half a second
  $scope.filter = '^page$';
  $scope.targetsFilterSelectedIndex = 1;
  $scope.devtoolsUrl = '';
  $scope.targets = new TargetsCollection();

  $scope.connect = function(target) {

    if(!target.devtoolsFrontendUrl) {
      throw new Error("devtoolsFrontendUrl is missing");
    }

    var webSocketUrl = target.webSocketDebuggerUrl.replace(/(ws|wss)\:\/\//, '');

    $scope.devtoolsUrl = 'devtools/front_end/inspector.html?ws=' + webSocketUrl + '&remoteFrontend=true';
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

    var req = $http.get(discoverUrl);

    req.success(function(data, status, headers, config) {
      $scope.targets.clear();

      data.forEach(function(item) {
        $scope.targets.add(item.id, item);
      });

    });

    req.catch(function() {

    });
  }

  $scope.showTargets = function() {
    $scope.devtoolsUrl = '';
  }

  $scope.showConnectPrompt = function(ev) {

    $mdDialog.show({
      controller: ConnectPromptController,
      templateUrl: 'connectPrompt.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
    })
    .then(function(url) {
      discoverUrl  = url;
    }, function() {

    });
  };

  $scope.startDiscoveryChecks = function rediscover(){
    $timeout(function(){
      $scope.discover()
      rediscover()
    }, $scope.REDISCOVERY_DELAY)
  }

  $scope.setupMenubars = function() {

    var remote = require('remote')
    var Menu = remote.require('menu')

    var template = [
      {
        label: 'Chrome DevTools',
        submenu: [
          {
            label: 'About Chrome DevTools',
            selector: 'orderFrontStandardAboutPanel:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            selector: 'terminate:'
          },
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'Command+R',
            click: function() {
              remote.getCurrentWindow().reload();
            }
          },
          {
            label: 'Toggle DevTools',
            accelerator: 'Alt+Command+I',
            click: function() {
              remote.getCurrentWindow().toggleDevTools();
            }
          },
        ]
      },
      {
        label: 'Targets',
        submenu: [
          {
            label: 'Connect to',
            accelerator: 'Alt+Command+C',
            click: function() {
              $scope.showConnectPrompt();
            }
          }
        ]
      }
    ];

    menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

  }

  // Initialize
  $scope.discover();
  // $scope.startDiscoveryChecks()
  $scope.setTargetFilter(localStorageService.get('currentFilter') || 'pages')
  $scope.setupMenubars();

});

function ConnectPromptController($scope, $mdDialog) {
  $scope.url = 'http://localhost:9222';

  $scope.cancel = function() {
    $mdDialog.cancel();
  }

  $scope.connect = function(url) {
    $mdDialog.hide(url);
  }

}
