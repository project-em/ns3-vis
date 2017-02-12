namespace cis450.main {

    export class ArtistController {

        songs: any[];
        artistId: string;
        artistName: string;
        songCount: string = '10';
        name: string;
        public constructor(private $http: ng.IHttpService) {}

        public autoCallback = (item: any) => {
            if (item.artist_id) {
                this.artistId = item.artist_id;
                this.name = item.name;
                this.loadSongs();
            }
        }

        public autocompleteArtists = (name: string) => {
            return this.$http.get("api/autocomplete/artists/" + name).then((response) => {
                return response.data;
            });
        };

        public loadSongs = () => {
            let url = "api/artists/" + this.name + "/songs";
            this.$http.get(url, { params: { n: this.songCount } }).then((response) => {
                this.songs = response.data as any[];
            });
        }

    }

    getModule().controller("ArtistController", ArtistController);
}