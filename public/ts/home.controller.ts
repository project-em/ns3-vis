namespace ns3.main {

    export class HomeController {

        constructor(private data: types.Topic) {      
            console.log(data);      
        }

        
    }

    getModule().controller("HomeController", HomeController);
}