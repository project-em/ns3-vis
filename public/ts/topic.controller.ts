namespace ns3.main {

    export class TopicController {

        constructor(private data: types.Source[]) {     

        }
        
        private chartConfig = {
            
        };
    }

    getModule().controller("TopicController", TopicController);
}