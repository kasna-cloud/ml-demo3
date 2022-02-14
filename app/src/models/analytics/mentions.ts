import { Transcript } from "../transcript";
import { ISample } from "../../interfaces/sample-interface";


export class Mention {
    public readonly entity: string;
    public readonly count: number;
    constructor(entity: string, count: number) {
        this.entity = entity;
        this.count = count;
    }
}

export class MentionCategory {
    public readonly category: string;
    public readonly mentions: Mention[];
    constructor(category: string, mentions: Mention[]) {
        this.category = category.toUpperCase();
        this.mentions = mentions;
    }
}

export class MentionsSample implements ISample {
    public readonly processChain: string[];
    public readonly timestamp: Date;

    public readonly categories: MentionCategory[];

    private constructor(
        processChain: string[],
        timestamp: Date,
        categories: MentionCategory[]
    ) {
        this.processChain = processChain;
        this.timestamp = timestamp;
        this.categories = categories;
    }

    public static FromTranscript(transcript: Transcript, analysedBy: string, categories: MentionCategory[]): MentionsSample {
        return new MentionsSample(
            [...transcript.processChain, analysedBy],
            transcript.timestamp,
            categories
        );
    }
}