'use strict';

angular.module('myApp.Jobs', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/states/:state/runs/:runId/jobs', {
            templateUrl: '/StateJobs/stateJobsView.html',
            controller: 'JobsController'
        });
    }])

    .controller('JobsController', ['$scope', 'JobsFactory', '$routeParams', 'GlobalVars',
        function ($scope, JobsFactory, $routeParams, GlobalVars) {
            $scope.api_url = GlobalVars.api_url;
            $scope.runners = new JobsFactory($routeParams.state, $routeParams.runId);
            $scope.runners.get();
            $scope.get_status_class = function (job) {
                if (job.error_count) {
                    return 'danger';
                }
                if (job.drop_count) {
                    return 'warning'
                }
            }
        }
    ]);