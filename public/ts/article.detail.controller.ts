namespace ns3.main {

    export class ArticleDetailController {

        constructor(private article: types.Article,
            private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService) {
        }
        

    }

    getModule().controller("ArticleDetailController", ArticleDetailController);
}