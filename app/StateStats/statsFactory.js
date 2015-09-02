ngApp.factory('StatsFactory', ['$resource', 'GlobalVars', function ($resource, GlobalVars) {
    var stats = function () {
        this.stats = [];
        this.service = $resource(GlobalVars.api_url + '/stats',
            {
                callback: "JSON_CALLBACK"
            }, {'get': {'method': 'GET', 'cache': true}}
        );
    };

    stats.prototype.get = function () {
        return this.service.get().$promise.then(function (data) {
            if (!data.error) {
                this.stats = data.stats;
            }
            else {
                console.log('Can\' load stats');
            }
        }.bind(this));
    };
    return stats;
}]);