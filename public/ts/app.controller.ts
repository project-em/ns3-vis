namespace cis450.main {

    export class AppController {

        public constructor(private $state: ng.ui.IStateService) {}

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