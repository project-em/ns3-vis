namespace ns3.main {

    export class AppController {

        topic: types.Topic;

        public constructor(private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService,
            private $http: ng.IHttpService,
            private topics: types.Topic[]) {
            let topicId = this.$stateParams['id'];
            if (topicId) {
                this.$http.get('/api/topic/' + topicId + '/name').then((response) => {
                    this.topic = response.data as types.Topic;
                })
            }
        }

        public filterTopic = (text: string) => {
            return this.topics.filter((value: types.Topic) => {
                return value.name.toLowerCase().indexOf(text.toLowerCase()) != -1;
            });
        }

        public autoCallback = (topic: types.Topic) => {
            this.$state.go('main.topic', { id: topic.id });
        };

        public isMain = () => {
            return this.$state.current.name == 'main.home';
        }

        public isSongs = () => {
            return this.$state.current.name == 'main.songs';
        }

        public isGenres = () => {
            return this.$state.current.name == 'main.genres';
        }

        public isArtists = () => {
            return this.$state.current.name == 'main.artists';
        }

        public isTags = () => {
            return this.$state.current.name == 'main.tags';
        }

    }

    getModule().controller("AppController", AppController);
}