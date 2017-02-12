namespace cis450.main {
    
    export class SongsController {

        public songName: string;
        songId: string;
        similarSongs: any[];
        chartLabels: string[];
        chartData: number[];
        songCount: string = '10';
        public constructor(private $http: ng.IHttpService) {}


        public autoCallback = (item: any) => {
            if (item.song_id) {
                this.songId = item.song_id;
                this.loadSimilar();
            }
        }

        public autocompleteSongs = (name: string) => {
            return this.$http.get("api/autocomplete/songs/" + name).then((response) => {
                return response.data;
            });
        };

        public loadSimilar = () => {
            this.$http.get("api/songs/" + this.songId + "/similar", {params: { n: this.songCount }}).then((response) => {
                this.similarSongs = response.data as any[];
                this.chartLabels = this.similarSongs.map((val) => {
                    return val.title;
                }) as string[];
                this.chartData = this.similarSongs.map((val) => {
                    return val.score;
                }) as number[];
                console.log(this.chartData);
            });
        }
    }

    cis450.main.getModule().controller("SongsController", SongsController);
}