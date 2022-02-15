import { Transcript } from "../../models/transcript";
import { Observable, of } from "rxjs";
import { MentionsSample, MentionCategory, Mention } from "../../models/analytics/mentions";

import * as nlp from 'compromise';
import { ITransformer } from "../../interfaces/sample-interface";

export class CompromiseAnalyticsProcessor implements ITransformer<Transcript, MentionsSample> {

    public readonly processName: string;
    private readonly compromiseVersion: string;

    constructor(compromiseVersion: string) {
        this.compromiseVersion = compromiseVersion;
        this.processName = `compromise-${this.compromiseVersion}`;
    }

    public transform(transcript: Transcript): Observable<MentionsSample> {

        const doc = (nlp as any)(transcript.text);
    
        const mapping: { [category: string]: string[] } = {
            'PERSON': doc.people().json().map(j => j.text),
            'LOCATION': doc.places().json().map(j => j.text),
            'ORGANIZATION': doc.organizations().json().map(j => j.text)
        };

        const categories = Object.entries(mapping)
            .map(([mappingCategory, entitiesMatched]) => {
                const withCounts = entitiesMatched.reduce<{ [entity: string]: number }>((all, entity) => {
                    if (entity in all) {
                        all[entity]++;
                    } else {
                        all[entity] = 1;
                    }
                    return all;
                }, {});
                const mentions = Object.entries(withCounts).map(
                    ([entity, mentionCount]) => new Mention(entity, mentionCount as number)
                );
                return new MentionCategory(mappingCategory, mentions);
            })

        return of(MentionsSample.FromTranscript(
            transcript,
            this.processName,
            categories
        ));
    }
}