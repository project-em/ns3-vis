namespace ns3.main {

    getModule().config(($stateProvider: ng.ui.IStateProvider, $locationProvider: ng.ILocationProvider,
        $urlRouterProvider: ng.ui.IUrlRouterProvider) => {
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $stateProvider.state('main', {
            url: '',
            templateUrl: 'html/layout.html',
            controller: 'AppController',
            controllerAs: 'ctrl',
            abstract: true,
            resolve: {
                topics: ($http: ng.IHttpService) => {
                    return $http.get('/api/topics').then((response) => {
                        return response.data as types.Topic[];
                    });
                },
            }
        })
        .state('main.home', {
            url: '/',
            templateUrl: 'html/home.html',
            controller: 'HomeController',
            controllerAs: 'ctrl',
        })
        .state('main.admin', {
            url: '/admin',
            templateUrl: 'html/admin.html',
            controller: 'AdminController',
            controllerAs: 'ctrl'
        })
        .state('main.topic', {
            url: '/topic?id',
            templateUrl: 'html/topic.html',
            controller: 'TopicController',
            controllerAs: 'ctrl',
            resolve: {
                topic: ($http: ng.IHttpService, $stateParams: ng.ui.IStateParamsService) => {
                    return $http.get('/api/topic/' + $stateParams['id'] + '/name').then((response) => {
                        return response.data as types.Topic;
                    });
                },
                data: ($http: ng.IHttpService, $stateParams: ng.ui.IStateParamsService) => {
                    return $http.get('/api/topic/' + $stateParams['id'] + '/articles').then((response) => {
                        return response.data as types.Source[];
                    });
                }
            }
        })
        .state("main.article", {
            url: "/article?id",
            templateUrl: "html/article.detail.html",
            controller: "ArticleDetailController",
            controllerAs: "ctrl",
            resolve: {
                article: ($http: ng.IHttpService, $stateParams: ng.ui.IStateParamsService) => {
                    return $http.get('/api/article/' + $stateParams['id']).then((response) => {
                        return response.data as types.Article;
                    });
                }
            }
        })
        ;
    });
}