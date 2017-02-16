namespace ns3.main.directives {

    interface ArticleDirectiveScope {
        article: types.Article;
    }

    export class ArticleDirectiveController {

        barData: number[] = [];
        barLabels: string[] = [];
        barOptions = {
            scales: {
                xAxes:  [{
                    ticks: {
                        min: -10,
                        max: 10,
                        stepSize: 2
                    }
                }]
            }
        };

        constructor(private $state: ng.ui.IStateService, 
                    private $scope: ArticleDirectiveScope) {
            this.barData.push(this.$scope.article.bias);
            this.barLabels.push("");
        }

        public go = () => {
            this.$state.go('main.article', { id : this.$scope.article.id });
        }
    }

    export class ArticleDirective {

        constructor() {}

        public restrict = 'E';
        public controller = 'ArticleDirectiveController';
        public controllerAs = 'ctrl';
        public templateUrl = 'html/directives/article.html';
        public scope = {
            article: '='
        };

        static Factory = () => {
            return () => new ArticleDirective();
        };
    }

    getModule().controller('ArticleDirectiveController', ArticleDirectiveController);
    getModule().directive('article', ArticleDirective.Factory());
}