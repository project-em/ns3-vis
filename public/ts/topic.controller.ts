namespace ns3.main {

    export class TopicController {

        chart = {
            labels: [],
            biases: []
        }
        barOptions = {
            responsive: true,
            maintainAspectRatio: false,
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
        constructor(private topic: types.Topic,
            private data: types.Source[],
            private $state: ng.ui.IState,
            private $stateParams: ng.ui.IStateParamsService) {
            Chart.defaults.global.scaleFontColor = '#FFFFFF';
            Chart.defaults.global.scaleLineColor = '#FFFFFF';
            // Chart.defaults.global.responsive = true;
            // Chart.defaults.global.maintainAspectRatio = false;
            this.topic = topic;
            this.data.forEach((obj) => {
                this.chart.labels.push(obj.name);
                this.chart.biases.push(obj.bias);
                this.barOptions.backgroundColor.push(obj.primaryColor);
            });
            if ($stateParams['id'] == -1) {
                this.chart = {
                    biases: [4, -2],
                    labels: ['CNN', 'The Hill']
                };
                // this.data = [
                //     {
                //         name: 'CNN',
                //         logo: '/logos/cnn.png',
                //         url: 'http://cnn.com',
                //         bias: 4,
                //         articles: [
                //             {
                //                 name: 'Testing Positive Data',
                //                 url: 'http://cnn.com',
                //                 body: 'This should be a positive article on the issue',
                //                 topic: {
                //                     name: 'Marijuana'
                //                 },
                //                 bias: 6
                //             },
                //             {
                //                 name: 'Testing Less Positive Data',
                //                 url: 'http://cnn.com',
                //                 body: 'This should be a less positive article on the issue',
                //                 topic: {
                //                     name: 'Marijuana'
                //                 },
                //                 bias: 2
                //             },
                //         ]
                //     },
                //     {
                //         name: 'The Hill',
                //         logo: '/logos/hill.jpg',
                //         url: 'http://thehill.com',
                //         bias: -2,
                //         articles: [
                //             {
                //                 name: 'Testing Negative Data',
                //                 url: 'http://thehill.com',
                //                 body: 'This should be a positive article on the issue',
                //                 topic: {
                //                     name: 'Marijuana'
                //                 },
                //                 bias: -5
                //             },
                //             {
                //                 name: 'Testing Less Negaive Data',
                //                 url: 'http://thehill.com',
                //                 body: 'This should be a less negative article on the issue',
                //                 topic: {
                //                     name: 'Marijuana'
                //                 },
                //                 bias: 1
                //             },
                //         ]
                //     }
                // ]
            }

        }
        
        private chartConfig = {
            
        };
    }

    getModule().controller("TopicController", TopicController);
}