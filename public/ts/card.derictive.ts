namespace ns3.main.directives {

    interface CardDirectiveScope {
        topic: types.Topic;
    }

    export class CardDirectiveController {
    
        chart = {
            labels: [],
            biases: []
        };
        barOptions = {
            backgroundColor: []
        };
        constructor(private $state: ng.ui.IStateService, 
                    private $scope: CardDirectiveScope) {
            $scope.topic.sources.forEach((obj) => {
                this.chart.labels.push(obj.name);
                this.chart.biases.push(obj.bias);
                this.barOptions.backgroundColor.push(obj.primaryColor);
            });
        }

        public dive = () => {
            this.$state.go("main.topic", { id: this.$scope.topic.id });
        }
    }

    export class CardDirective {

        constructor() {}

        public restrict = 'E';
        public controller = 'CardDirectiveController';
        public controllerAs = 'ctrl';
        public templateUrl = 'html/directives/card.html';
        public scope = {
            topic: '='
        };

        static Factory = () => {
            return () => new CardDirective();
        };
    }

    getModule().controller('CardDirectiveController', CardDirectiveController);
    getModule().directive('card', CardDirective.Factory());
}