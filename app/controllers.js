
var gui = require('nw.gui');

var app = angular.module('app', []);

app.controller('home', function ($scope, $http, $location) {

	$scope.debug = function() {
		console.log('debug');
		var win = gui.Window.get();
		
		win.showDevTools();		
	}

	$scope.connect = function(target) {

		console.log('target', target);

		if(!target.devtoolsFrontendUrl) {
			return 
		}

		var frontendUrl = target.devtoolsFrontendUrl.replace('/devtools/', '');
		var win = gui.Window.get();

		var new_win = gui.Window.get(
  			window.open('./devtools/front_end/' + frontendUrl)
		);

	}	

	$scope.discover = function() {
		var req = $http.get('http://localhost:9222/json');

		req.success(function(data, status, headers, config) {
			$scope.targets = data;
	  	});

	  	req.catch(function() {
	  		$scope.targets = [];
	  	});

	}

	$scope.discover();

});