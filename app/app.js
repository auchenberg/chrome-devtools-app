var app = angular.module('app', ['ngAnimate', 'ngMaterial']);

angular.element(document).ready(function () {
    var gui = require('nw.gui');
    var win = gui.Window.get();
    //In order to deal with "close" from menu bar, and close from the Dock
    win.on('close', function(event) {
      if (event == 'quit') {
        win.close(true);
      } else { 
       // event is `undefined`
        win.hide();
      }
    });
    gui.App.on('reopen', function() {
        win.show();
    });
    //Close from cmd + q
    document.addEventListener('keydown', function(event) {
        if(event.keyCode == 81 && event.metaKey){
            win.close(true);
        }
        
    });
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

app.controller('home', function ($scope, $http, $location) {

    $scope.filter = '^page$';
    $scope.targetsFilterSelectedIndex = 1;
    $scope.targets = [];
    $scope.devtoolsUrl = '';

    $scope.debug = function() {

        var gui = require('nw.gui');
        var win = gui.Window.get();

        win.showDevTools();
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
