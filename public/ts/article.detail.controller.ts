namespace ns3.main {

    export class ArticleDetailController {

        constructor(private article: types.Article,
            private $stateParams: ng.ui.IStateParamsService) {
        }
        
    }

    getModule().controller("ArticleDetailController", ArticleDetailController);
}