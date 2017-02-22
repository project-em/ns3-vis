namespace ns3.main {

    export class TopicController {

        chart = {
            labels: [],
            biases: []
        }
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
        constructor(private data: types.Source[],
            private $stateParams: ng.ui.IStateParamsService) {
            this.data.forEach((obj) => {
                this.chart.labels.push(obj.name);
                this.chart.biases.push(obj.bias);
            });
            if ($stateParams['id'] == -1) {
                this.chart = {
                    biases: [4, -2],
                    labels: ['CNN', 'The Hill']
                };
                this.data = [
                    {
                        name: 'CNN',
                        logo: '/logos/cnn.png',
                        url: 'http://cnn.com',
                        bias: 4,
                        articles: [
                            {
                                name: 'Testing Positive Data',
                                url: 'http://cnn.com',
                                body: 'This should be a positive article on the issue',
                                topic: {
                                    name: 'Marijuana'
                                },
                                bias: 6
                            },
                            {
                                name: 'Testing Less Positive Data',
                                url: 'http://cnn.com',
                                body: 'This should be a less positive article on the issue',
                                topic: {
                                    name: 'Marijuana'
                                },
                                bias: 2
                            },
                        ]
                    },
                    {
                        name: 'The Hill',
                        logo: '/logos/hill.jpg',
                        url: 'http://thehill.com',
                        bias: -2,
                        articles: [
                            {
                                name: 'Testing Negative Data',
                                url: 'http://thehill.com',
                                body: 'This should be a positive article on the issue',
                                topic: {
                                    name: 'Marijuana'
                                },
                                bias: -5
                            },
                            {
                                name: 'Testing Less Negaive Data',
                                url: 'http://thehill.com',
                                body: 'This should be a less negative article on the issue',
                                topic: {
                                    name: 'Marijuana'
                                },
                                bias: 1
                            },
                        ]
                    }
                ]
            }

        }
        
        private chartConfig = {
            
        };
    }

    getModule().controller("TopicController", TopicController);
}