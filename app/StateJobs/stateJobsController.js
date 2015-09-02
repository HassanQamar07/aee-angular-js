'use strict';

angular.module('myApp.Jobs', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/states/:state/runs/:runId/jobs', {
            templateUrl: '/StateJobs/stateJobsView.html',
            controller: 'JobsController'
        });
    }])

    .controller('JobsController', ['$scope', 'JobsFactory', '$routeParams',
        function ($scope, JobsFactory, $routeParams) {
            console.log('Hi from jobs controller');
            $scope.runners = new JobsFactory($routeParams.state, $routeParams.runId);
            $scope.runners.get();
        }
    ]);