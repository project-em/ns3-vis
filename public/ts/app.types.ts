namespace ns3.main.types {

    export interface Data {
        id?: number;
    }

    export interface Topic extends Data {
        name: string;
    }

    export interface Sentence extends Data {
        content: string;
        bias: number;
    };

    export interface Article extends Data {
        name: string;
        url: string;
        body: string;
        topic: Topic;
        bias?: number;
        sentences?: Sentence[];
    }

    export interface Source extends Data {
        name: string;
        logo: string;
        url: string;
        articles?: Article[];
        bias?: number;
    }

}