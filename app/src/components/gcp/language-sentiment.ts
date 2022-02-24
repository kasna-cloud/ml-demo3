import { Transcript } from "../../models/transcript";
import { SentimentSample, Sentiment } from "../../models/analytics/sentiment";
import { ITransformer } from "../../interfaces/sample-interface";
import { Observable, from, of } from "rxjs";
import * as language from "@google-cloud/language";
import { map } from "rxjs/operators";

export class GcpLanguageSentiment implements ITransformer<Transcript, SentimentSample> {

    public readonly processName: string = `gcp`;

    private readonly languageClient: language.v1.LanguageServiceClient;

    constructor() {
        this.languageClient = new language.LanguageServiceClient();
    }

    public transform(transcript: Transcript): Observable<SentimentSample> {
        if (transcript.text.length === 0) {
            return of(SentimentSample.FromTranscript(
                transcript,
                this.processName,
                new Sentiment(0, 0, 0, 0)
            ));
        }
        return from(this.languageClient.analyzeSentiment({
            document: {
                type: `PLAIN_TEXT`,
                content: transcript.text
            }
        })).pipe(
            map(([response, request, _]) => {
                const sentimentValue = response?.documentSentiment?.score ?? 0;
                const sentiment = new Sentiment(
                    Math.max(sentimentValue, 0),
                    -Math.min(sentimentValue, 0),
                    0,
                    0
                );
                return SentimentSample.FromTranscript(
                    transcript,
                    this.processName,
                    sentiment
                );
            })
        );
    }

}
