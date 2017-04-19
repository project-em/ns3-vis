namespace ns3.main.directives {

    interface SourceDirectiveScope {
        source: types.Source;
    }

    export class SourceDirectiveController {

        barOptions = {
            backgroundColor: [],
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                labels: {
                    fontColor: this.lineColor,
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
                        fontColor: this.lineColor,
                    },
                    scaleLabel: {
                        display: true,
                        fontColor: this.lineColor,
                        labelString: "Liberal <-------> Conservative"
                    },
                    gridLines: {
                        display: true,
                        zeroLineColor: this.lineColor,
                        zeroLineWidth: 3
                    }
                }],
                yAxes: [{
                    gridLines: {
                        // color: "#FFFFFF"
                    },
                    ticks: {
                        fontColor: this.lineColor
                    }
                }]
            },
        };

        constructor(private $state: ng.ui.IStateService, 
                    private $scope: SourceDirectiveScope,
                    private $window: ng.IWindowService) {
            var count = 0;
            this.lineColor = this.$scope.source.primaryColor == "#FFFFFF" ? "black" : "white";
            this.$scope.source.articles.map((article) => {
                this.chart.labels.push(article.name.substring(0, Math.min(47, article.name.length)) +
                    (article.name.length > 47 ? "..." : ""));
                this.chart.biases.push(article.bias);
                this.barOptions.backgroundColor.push("#222222")
            });
        }

        lineColor = "#FFFFFF";

        chart = {
            labels: [],
            biases: []
        }

        private hexToRgb = (hex) => {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        private getBackground = (alpha) => {top
            let rgbs = this.hexToRgb(this.$scope.source.primaryColor);
            return 'rgba(' + rgbs.r + ', ' + rgbs.g + ', ' + rgbs.b + ', ' + alpha + ')';
        }

        public go = () => {
            if (this.$scope.source.url.indexOf('http://') == -1 && this.$scope.source.url.indexOf('https://') == -1) {
                this.$scope.source.url = 'http://' + this.$scope.source.url;
            }
            console.log(this.$scope.source.url);
            this.$window.open(this.$scope.source.url);
        }
    }

    export class SourceDirective {

        constructor() {}

        public restrict = 'E';
        public controller = 'SourceDirectiveController';
        public controllerAs = 'ctrl';
        public templateUrl = 'html/directives/source.html';
        public scope = {
            source: '='
        };

        static Factory = () => {
            return () => new SourceDirective();
        };
    }

    getModule().controller('SourceDirectiveController', SourceDirectiveController);
    getModule().directive('source', SourceDirective.Factory());
}