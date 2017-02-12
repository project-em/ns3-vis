namespace ns3.main {

    var app = angular.module('ns3', [
        'ui.bootstrap',
        'ui.router',
        'chart.js',
        'ngTagCloud'
    ]);

    export var getModule = () => {
        return angular.module('ns3');
    }
}