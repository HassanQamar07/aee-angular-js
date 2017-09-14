'use strict';

// Declare app level module which depends on views, and components

var ngApp = angular.module('myApp', [
    'ngResource',
    'ngRoute',
    'myApp.StateDockets', 'myApp.Stats','myApp.StateRuns','myApp.Jobs',
    'myApp.version', 'angular-loading-bar', 'ngAnimate', 'infinite-scroll'
]);


ngApp.value('GlobalVars', {'api_url': 'http://'+window.location.hostname+':5000'});

ngApp.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
    $httpProvider.defaults.stripTrailingSlashes = true;
    $locationProvider.html5Mode(true);
    $routeProvider.otherwise({redirectTo: '/stats'});
}]);

