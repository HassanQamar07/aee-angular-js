ngApp.factory('JobsFactory', ['$resource', 'GlobalVars', function ($resource, GlobalVars) {
    var stats = function (state, run_id) {
        this.jobs = [];
        this.state = state;
        this.run_id = run_id;
        this.service = $resource(GlobalVars.api_url + '/states/:state/runs/:run_id/jobs',
            {
                callback: "JSON_CALLBACK", state: '@state', run_id: '@run_id'
            }, {'get': {'method': 'GET', 'cache': true}}
        );
    };

    stats.prototype.get = function () {
        return this.service.get({'state': this.state, 'run_id': this.run_id}).$promise.then(function (data) {
            if (!data.error) {
                this.jobs = data.runs[0].jobs;
            }
            else {
                console.log('Can\' load stats');
            }
        }.bind(this));
    };
    return stats;
}]);