namespace ns3.main {

    export class ArticleDetailController {

        constructor(private sentences: types.Sentence[],
            private $stateParams: ng.ui.IStateParamsService) {
        }
        
    }

    getModule().controller("ArticleDetailController", ArticleDetailController);
}