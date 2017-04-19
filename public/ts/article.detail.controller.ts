namespace ns3.main {



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

        constructor(private article: types.Article,
            private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService) {
            
                this.barData.push(article.bias);
                this.barLabels.push("");
                this.barOptions.backgroundColor.push(article.bias > 0 ? "#e93737" : "#2874e7");
                console.log(this.barOptions.backgroundColor);
        }

    }

    getModule().controller("ArticleDetailController", ArticleDetailController);
}