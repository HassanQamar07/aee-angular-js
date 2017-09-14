'use strict';

angular.module('myApp.StateDockets', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/states/:state/dockets', {
            templateUrl: 'StateDockets/StateDocketView.html',
            controller: 'StateDocketsController'
        }).when('/states/:state/jobs/:jobId/dockets', {
            templateUrl: 'StateDockets/StateDocketView.html',
            controller: 'StateDocketsController'
        });
    }])

    .controller('StateDocketsController', ['$scope', '$routeParams', 'StateSingleDocketsFactory', 'GlobalVars', 'docketsLoader',
        function ($scope, $routeParams, StateSingleDocketsFactory, GlobalVars, docketsLoader) {
            $scope.api_url = GlobalVars.api_url;
            $scope.dockets = [];
            $scope.state = $routeParams.state;
            $scope.staging = $routeParams.staging;
            $scope.total_dockets = 0;
            $scope.selected_docket = {};
            $scope.selected_docket_id = '';
            $scope.pagination = {'busy': false, cursor: ''};
            $scope.show_docket = function (docket_id) {
                $scope.selected_docket_id = docket_id;
                StateSingleDocketsFactory.get($routeParams.state, docket_id,$routeParams.staging).$promise.then(function (data) {
                    if (!data.error) {
                        $scope.selected_docket = data.dockets[0];
                        $('#docket-modal').modal('show');
                    } else {
                        console.log('Docket not found or filing not found');
                    }
                }, function (reason) {
                    console.log(reason);
                });
            };
            console.log($routeParams);
            var call_url = '';
            if ($routeParams.jobId)
                call_url = '/states/:state/jobs/:job/dockets';
            else
                call_url = '/states/:state/dockets';
            $scope.reddit = new docketsLoader($routeParams.state, call_url, $routeParams.jobId,$routeParams.staging);
            $scope.clear_filter = function () {
                $scope.filter_input = ""
            }
        }
    ]);
