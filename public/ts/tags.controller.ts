namespace cis450.main {
    
    export class TagsController {

        public songName: string;
        tags: any[];
        songId: string;
        chartData: any[];
        songCount: string = '10';
        public constructor(private $http: ng.IHttpService) {}


        public autoCallback = (item: any) => {
            if (item.song_id) {
                this.songId = item.song_id;
                this.loadTags();
            }
        }

        public autocompleteSongs = (name: string) => {
            return this.$http.get("api/autocomplete/songs/" + name).then((response) => {
                return response.data;
            });
        };

        public loadTags = () => {
            this.$http.get("api/songs/" + this.songId + "/tags", {params: { n: this.songCount }}).then((response) => {
                this.tags = response.data as any[];
                this.chartData = this.tags.map((val) => {
                    return {
                        text: val[0],
                        weight: val[1]
                    };
                }) as any[];
            });
        }
    }

    getModule().controller("TagsController", TagsController);
}