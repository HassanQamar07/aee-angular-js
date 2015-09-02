'use strict';

angular.module('myApp.StateRuns', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/states/:state/runs/:type', {
            templateUrl: '/StateRuns/stateRunsView.html',
            controller: 'RunsController'
        });
    }])

    .controller('RunsController', ['$scope', 'StateRunsFactory','$routeParams',
        function ($scope, StateRunsFactory, $routeParams) {
            console.log('Hi from runs controller');
            $scope.runners = new StateRunsFactory($routeParams.state, $routeParams.type);
            $scope.runners.get();
        }
    ]);
/**
 * Created by hassan on 9/2/15.
 */
