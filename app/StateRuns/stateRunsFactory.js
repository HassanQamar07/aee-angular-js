ngApp.factory('StateRunsFactory', ['$resource', 'GlobalVars', function ($resource, GlobalVars) {
    var stats = function (state, type) {
        this.runs = [];
        this.state = state;
        this.type = type;
        this.service = $resource(GlobalVars.api_url + '/states/:state/runs/:type',
            {
                callback: "JSON_CALLBACK", state: '@state', type: '@type'
            }, {'get': {'method': 'GET', 'cache': true}}
        );
    };

    stats.prototype.get = function () {
        return this.service.get({'state': this.state, 'type': this.type}).$promise.then(function (data) {
            if (!data.error) {
                this.runs = data.runs;
            }
            else {
                console.log('Can\' load stats');
            }
        }.bind(this));
    };
    return stats;
}]);