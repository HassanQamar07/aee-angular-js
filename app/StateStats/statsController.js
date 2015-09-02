'use strict';

angular.module('myApp.Stats', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/stats', {
            templateUrl: 'StateStats/statsView.html',
            controller: 'statsController'
        });
    }])

    .controller('statsController', ['$scope', 'StatsFactory', 'GlobalVars',
        function ($scope, StatsFactory, GlobalVars) {
            $scope.stats = new StatsFactory();
            $scope.stats.get();
        }
    ]);
