import { SentimentSample, Sentiment } from "../../models/analytics/sentiment";
import { Transcript } from "../../models/transcript";
import { Observable, of } from "rxjs";

import * as nlp from 'natural';
import { ITransformer } from "../../interfaces/sample-interface";

export class NaturalAnalyticsProcessor implements ITransformer<Transcript, SentimentSample> {
    
    public readonly processName: string;
    private readonly naturalVersion: string;
    private readonly tokenizer;
    private readonly sentimentAnalyzer;

    constructor(naturalVersion: string) {
        this.naturalVersion = naturalVersion;
        this.processName = `opensource`;
        this.tokenizer = new nlp.WordTokenizer();
        this.sentimentAnalyzer = new nlp.SentimentAnalyzer("English", nlp.PorterStemmer, "afinn");
    }

    public transform(transcript: Transcript): Observable<SentimentSample> {

        const tokens = this.tokenizer.tokenize(transcript.text);
        const sentimentValue = this.sentimentAnalyzer.getSentiment(tokens);
        
        const sentiment = new Sentiment(
            Math.max(sentimentValue, 0),
            -Math.min(sentimentValue, 0),
            0,
            0
        );

        return of(SentimentSample.FromTranscript(
            transcript,
            this.processName,
            sentiment
        ));
    }
}