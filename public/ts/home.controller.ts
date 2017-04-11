namespace ns3.main {

    export class HomeController {

        constructor(private data: types.Topic) {            
        }

        
    }

    getModule().controller("HomeController", HomeController);
}