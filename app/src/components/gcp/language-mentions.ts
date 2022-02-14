import { Transcript } from "../../models/transcript";
import { ITransformer } from "../../interfaces/sample-interface";
import { Observable, from, of } from "rxjs";
import * as language from "@google-cloud/language";
import { map } from "rxjs/operators";
import { MentionsSample, Mention, MentionCategory } from "../../models/analytics/mentions";

export class GcpLanguageMentions implements ITransformer<Transcript, MentionsSample> {

    public readonly processName: string = `gcplanguage`;

    private readonly languageClient: language.v1.LanguageServiceClient;

    constructor() {
        this.languageClient = new language.LanguageServiceClient();
    }

    public transform(transcript: Transcript): Observable<MentionsSample> {
        if (transcript.text.length === 0) {
            return of(MentionsSample.FromTranscript(
                transcript,
                this.processName,
                []
            ));
        }
        return from(this.languageClient.analyzeEntities({
            document: {
                type: `PLAIN_TEXT`,
                content: transcript.text
            }
        })).pipe(
            map(([response, request, _]) => {
                const detectedCategories: string[] = Array.from(new Set(response?.entities?.map(e => e.type))) as string[];
                const mentionCategories = detectedCategories.map(category => {
                    const entities = response?.entities?.filter(e => e.type === category);
                    const withCounts = entities.reduce<{ [entity: string]: number }>((all, entity) => {
                        if (entity.name in all) {
                            all[entity.name] += entity.mentions?.length ?? 1;
                        } else {
                            all[entity.name] = entity.mentions?.length ?? 1;
                        }
                        return all;
                    }, {});
                    const mentions = Object.entries(withCounts).map(
                        ([entity, mentionCount]) => new Mention(entity, mentionCount as number)
                    );
                    return new MentionCategory(category, mentions);
                });
                return MentionsSample.FromTranscript(
                    transcript,
                    this.processName,
                    mentionCategories
                );
            })
        );
    }

}
