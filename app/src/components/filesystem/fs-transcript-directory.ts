import { FSMinuteDirectory } from "./fs-minute-directory";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ISource, ISink, ISample } from "../../interfaces/sample-interface";
import { Transcript } from "../../models/transcript";

export class FSTranscriptDirectory extends FSMinuteDirectory implements ISource<Transcript>, ISink<Transcript> {

    constructor(
        directory: string
    ) {
        super(directory, '.json');
    }
    
    public getSamples(sources: string[], includePastData: boolean=false): Observable<ISample> {
        return super.pollForNewSamples(sources, includePastData);
    }

    public load(sample: ISample): Observable<Transcript> {
        return super.loadSample(sample).pipe(
            map(data => Transcript.FromSource(sample, JSON.parse(data.toString())))
        );
    }

    public save(transcript: Transcript): Observable<Transcript> {
        return super.uploadSample(
            transcript,
            Buffer.from(JSON.stringify(transcript))
        ).pipe(
            map(() => transcript)
        );
    }

}