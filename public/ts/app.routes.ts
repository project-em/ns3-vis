namespace ns3.main {

    getModule().config(($stateProvider: ng.ui.IStateProvider, $locationProvider: ng.ILocationProvider,
        $urlRouterProvider: ng.ui.IUrlRouterProvider) => {
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $stateProvider.state('main', {
            url: '/',
            templateUrl: 'html/layout.html',
            controller: 'AppController',
            controllerAs: 'ctrl',
            abstract: true,
            resolve: {
                topics: ($http: ng.IHttpService) => {
                    return $http.get('/api/topics').then((response) => {
                        return response.data;
                    });
                }
            }
        })
        .state('main.home', {
            url: '',
            templateUrl: 'html/home.html',
            controller: 'HomeController',
            controllerAs: 'ctrl',
        })
        .state('main.artists', {
            url: 'artists',
            templateUrl: 'html/artists.html',
            controller: 'ArtistController',
            controllerAs: 'ctrl'
        })
        ;
    });
}