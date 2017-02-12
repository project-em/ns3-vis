namespace cis450.main {

    export class GenresController {

        genres: any[];
        artistId: string;
        artistName: string;
        songCount: string = '10';
        name: string;
        chartData: number[];
        chartLabels: string[];
        public constructor(private $http: ng.IHttpService) {}

        public autoCallback = (item: any) => {
            if (item.artist_id) {
                this.artistId = item.artist_id;
                this.name = item.name;
                this.loadGenres();
            }
        }

        public autocompleteArtists = (name: string) => {
            return this.$http.get("api/autocomplete/artists/" + name).then((response) => {
                return response.data;
            });
        };

        public loadGenres = () => {
            let url = "api/artists/" + this.name + "/genres";
            this.$http.get(url, { params: { n: this.songCount } }).then((response) => {
                this.genres = response.data as any[];
                if (eval.length) {
                    this.chartLabels = this.genres.map((val) => {
                        return val._id;
                    }) as string[];
                    this.chartData = this.genres.map((val) => {
                        return val.score;
                    }) as number[];
                }
                console.log(this.chartData);
            });
        }
    }

    getModule().controller("GenresController", GenresController);
}