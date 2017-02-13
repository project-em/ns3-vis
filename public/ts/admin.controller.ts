namespace ns3.main {

    export class AdminController {

        public constructor(private $http: ng.IHttpService) {}

    }

    getModule().controller("AdminController", AdminController);
}