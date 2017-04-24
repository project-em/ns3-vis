namespace ns3.main {

    export class HomeController {

        data: any // key is topicName, value is arr of sources

        constructor(private $http: ng.IHttpService) {
            $http.get('/api/previews').then((response) => {
                this.data = Object.keys(response.data).map((key) => {
                    return {
                        "name": key,
                        "id" : response.data[key][0]["topicId"],
                        "sources": response.data[key]
                    };
                });
                console.log(this.data);
            });
        }

        
    }

    getModule().controller("HomeController", HomeController);
}