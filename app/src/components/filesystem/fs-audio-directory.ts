import { FSMinuteDirectory } from "./fs-minute-directory";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AudioSegment } from "../../models/audio-segment";
import { ISource, ISink, ISample } from "../../interfaces/sample-interface";

export class FSAudioDirectory extends FSMinuteDirectory implements ISource<AudioSegment>, ISink<AudioSegment> {

    constructor(
        directory: string
    ) {
        super(directory, '.mp3');
    }
    
    public getSamples(sources: string[], includePastData: boolean=false): Observable<ISample> {
        return super.pollForNewSamples(sources, includePastData);
    }

    public load(sample: ISample): Observable<AudioSegment> {
        return super.loadSample(sample).pipe(
            map(data => AudioSegment.FromSource(sample, data))
        );
    }

    public save(audioSample: AudioSegment): Observable<AudioSegment> {
        return super.uploadSample(
            audioSample,
            audioSample.data
        ).pipe(
            map(() => audioSample)
        );
    }

}