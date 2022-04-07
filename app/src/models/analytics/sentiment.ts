import { Transcript } from "../transcript";
import { ISample } from "../../interfaces/sample-interface";


export class Sentiment {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
    constructor(positive: number, negative: number, neutral: number, mixed: number) {
        this.positive = positive;
        this.negative = negative;
        this.neutral = neutral;
        this.mixed = mixed;
    }
}

export class SentimentSample implements ISample {
    public readonly processChain: string[];
    public readonly timestamp: Date;

    public readonly sentiment: Sentiment;

    private constructor(
        processChain: string[],
        timestamp: Date,
        sentiment: Sentiment
    ) {
        this.processChain = processChain;
        this.timestamp = timestamp;
        this.sentiment = sentiment;
    }

    public static FromTranscript(transcript: Transcript, analysedBy: string, sentiment: Sentiment): SentimentSample {
        return new SentimentSample(
            [...transcript.processChain, analysedBy],
            transcript.timestamp,
            sentiment
        );
    }
}