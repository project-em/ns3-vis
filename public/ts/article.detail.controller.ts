namespace ns3.main {

    export interface ArticleScope extends ng.IScope {
        slider: any;
    }
    export class ArticleDetailController {

        
        barData = [];
        barLabels = [];
        barOptions = {
            responsive: true,
            maintainAspectRatio: false,
            lineAtIndex: 0,
            backgroundColor: [],
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
                        labelString: "Liberal <---> Conservative"
                    },
                    gridLines: {
                        display: true,
                        zeroLineColor: "#FFFFFF"
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

        private gradient = true;

        private demo = {
            liberal: {
                text: "Liberal",
                bias: -20
            },
            neutral: {
                text: "Neutral",
                bias: 0
            },
            conservative: {
                text: "Conservative",
                bias: 20
            }
        }

        private slider;


        constructor(private article: types.Article,
            private $state: ng.ui.IStateService,
            private $scope: ArticleScope,
            private $stateParams: ng.ui.IStateParamsService) {
            
                this.barData.push(article.bias);
                this.barLabels.push("");
                this.barOptions.backgroundColor.push(article.bias > 0 ? "#e93737" : "#2874e7");

                $scope.$watch("slider.value", (newValue) => {
                    this.article.threshold = newValue as number;
                });

                $scope.slider = {
                    value: this.article.threshold,
                    options: {
                        floor: 0,
                        ceil: 1,
                        step: 0.01,
                        precision: 2,
                        minLimit: 0,
                        maxLimit: 1,
                        showSelectionBar: true,
                        getPointerColor: (value) => {
                            return "hsl(0, 0%, " + ((1 - value) * 100) + "%)";
                        }
                    }
                };
        }

    }

    getModule().controller("ArticleDetailController", ArticleDetailController);
}