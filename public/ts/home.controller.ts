namespace ns3.main {

    export class HomeController {

        data: types.Topic[]

        constructor(private $http: ng.IHttpService) {
            $http.get('/api/previews').then((response) => {
                this.data = response.data as types.Topic[];
                console.log(this.data);
            });
        }

        
    }

    getModule().controller("HomeController", HomeController);
}