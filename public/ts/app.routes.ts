namespace cis450.main {

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
            abstract: true
        })
        .state('main.home', {
            url: '',
            templateUrl: 'html/home.html',
            controller: 'HomeController',
            controllerAs: 'ctrl',
        })
        .state('main.songs', {
            url: 'songs',
            templateUrl: 'html/songs.html',
            controller: 'SongsController',
            controllerAs: 'ctrl',
        })
        .state('main.genres', {
            url: 'genres',
            templateUrl: 'html/genres.html',
            controller: 'GenresController',
            controllerAs: 'ctrl'
        })
        .state('main.artists', {
            url: 'artists',
            templateUrl: 'html/artists.html',
            controller: 'ArtistController',
            controllerAs: 'ctrl'
        })
        .state('main.tags', {
            url: 'tags',
            templateUrl: 'html/tags.html',
            controller: 'TagsController',
            controllerAs: 'ctrl'
        })
    });
}