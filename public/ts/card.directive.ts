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
            lineAtIndex: 0,
            backgroundColor: [],
            legend: {
                labels: {
                    fontColor: "#FFFFFF",
                    fontSize: 18
                }
            },
            scales: {
                xAxes:  [{
                    ticks: {
                        min: -5,
                        max: 5,
                        stepSize: 1,
                        callback: function(value, index, values) { 
                            return Math.abs(value);
                        },
                        fontColor: "#FFFFFF"
                    },
                    scaleLabel: {
                        display: true,
                        fontColor: "#FFFFFF",
                        labelString: "Liberal <-------> Conservative"
                    },
                    gridLines: {
                        display: true,
                        zeroLineColor: "#FFFFFF",
                        zeroLineWidth: 3
                    }
                }],
                yAxes: [{
                    gridLines: {
                        // color: "#FFFFFF"
                    },
                    ticks: {
                        fontColor: "#FFFFFF",
                    }
                }]
            },
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