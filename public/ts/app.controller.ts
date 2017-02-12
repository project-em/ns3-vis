namespace ns3.main {

    export class AppController {

        topic: types.Topic;

        public constructor(private $state: ng.ui.IStateService,
            private topics: types.Topic[]) {}

        public filterTopic = (text: string) => {
            return this.topics.filter((value: types.Topic) => {
                return value.name.toLowerCase().indexOf(text.toLowerCase()) != -1;
            });
        }

        public autoCallback = (topic: types.Topic) => {
            // go to topic page here
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