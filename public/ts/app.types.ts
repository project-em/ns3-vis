namespace ns3.main.types {

    export interface Data {
        id: number;
    }

    export interface Topic extends Data {
        name: string;
    }

    export interface Article extends Data {
        name: string;
        url: string;
        body: string;
        topic: Topic;
    }
}