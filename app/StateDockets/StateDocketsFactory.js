ngApp.factory('StateSingleDocketsFactory', ['$resource', 'GlobalVars', function ($resource, GlobalVars) {
    function state_docket() {
        this.service = $resource(GlobalVars.api_url + '/states/:state/dockets/:docket',
            {
                callback: "JSON_CALLBACK", state: '@state', docket: '@docket'
            }
        );
    }

    state_docket.prototype.get = function (state, docket) {
        return this.service.get({state: state, docket: docket});
    };
    return new state_docket;
}]);


ngApp.factory('docketsLoader', ['GlobalVars', '$resource', function (GlobalVars, $resource) {
    var docketsLoader = function (state) {
        this.items = [];
        this.busy = false;
        this.cursor = '';
        this.total_dockets = 0;
        this.state = state;
        this.service = $resource(GlobalVars.api_url + '/states/:state/dockets',
            {
                callback: "JSON_CALLBACK", state: '@state', cursor: '@cursor'
            }
        );
    };
    docketsLoader.prototype.load_dockets = function () {
        if (this.busy)
            return;
        this.busy = true;
        this.service.get({state: this.state, cursor: this.cursor}).$promise.then(function (data) {
            if (!data.error) {
                this.cursor = data.meta.cursor;
                if (this.cursor)
                    this.busy = false;
                var items = data.dockets;
                for (var i = 0; i < items.length; i++) {
                    this.items.push(items[i]);
                }
                this.total_dockets = data.meta.total_dockets;
                return data
            }
            else {
                console.log('Can\'t load store data');
            }
        }.bind(this));
    };
    return docketsLoader;
}]);