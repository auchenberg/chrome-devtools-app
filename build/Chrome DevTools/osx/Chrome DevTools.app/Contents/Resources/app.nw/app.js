
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

    // make it possible to run the app in a browser environment
    if(typeof require === 'function') { 
        $scope.gui = require('nw.gui');
        $scope.win = $scope.gui.Window.get();

        var nativeMenuBar = new $scope.gui.Menu({ type: "menubar" });
        nativeMenuBar.createMacBuiltin('Chrome DevTools');

        $scope.win.menu = nativeMenuBar;
    }

    $scope.debug = function() {
        $scope.win.showDevTools();
    }

    $scope.connect = function(target) {

        if(!target.devtoolsFrontendUrl) {
            return;
        }

        var frontendUrl = target.devtoolsFrontendUrl.replace('/devtools/', '');

        $scope.devtoolsUrl = 'devtools/front_end/' + frontendUrl
    }

    $scope.setTargetFilter = function(filter) {

        switch(filter) {
            case 'apps':
                $scope.filter = '^apps$';
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
