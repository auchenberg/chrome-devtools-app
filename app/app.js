
var app = angular.module('app', ['ngAnimate', 'ngMaterial']);

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

app.controller('home', function ($scope, $http, $location) {

    $scope.filter = '^page$';
    $scope.targetsFilterSelectedIndex = 1;
    $scope.targets = [];
    $scope.devtoolsUrl = '';

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

    $scope.connect = function(target) {

        if(!target.devtoolsFrontendUrl) {
            return;
        }

        var webSocketUrl = target.webSocketDebuggerUrl.replace(/(ws|wss)\:\/\//, '');

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

    }

    $scope.discover = function() {
        var req = $http.get('http://localhost:9222/json');
        // var req = $http.get('/json.json');

        req.success(function(data, status, headers, config) {
            $scope.targets = data;
        });

        req.catch(function() {

        });
    }

    $scope.showTargets = function() {
        $scope.devtoolsUrl = '';
    }

    $scope.discover();

});
