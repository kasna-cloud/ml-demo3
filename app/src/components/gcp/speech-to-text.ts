import { ITransformer } from "../../interfaces/sample-interface";
import { AudioSegment } from "../../models/audio-segment";
import { Transcript } from "../../models/transcript";
import { Observable, from } from "rxjs";
import * as speech from "@google-cloud/speech";
import { map } from "rxjs/operators";


export class GcpSpeechToText implements ITransformer<AudioSegment, Transcript> {

    public readonly processName: string = `gcp`;

    private readonly speechClient;
    private readonly audioLanguageCode: string;

    constructor(
        audioLanguageCode: string = 'en-US'
    ) {
        this.speechClient = new speech.SpeechClient();
        this.audioLanguageCode = audioLanguageCode;
    }

    public transform(inputAudio: AudioSegment): Observable<Transcript> {
        return from(this.speechClient.recognize({
            audio: {
                content: inputAudio.data
            },
            config: {
                encoding: 'ENCODING_UNSPECIFIED',
                sampleRateHertz: 16000,
                languageCode: this.audioLanguageCode
            }
        })).pipe(
            map(data => Transcript.FromAudio(
                inputAudio,
                this.processName,
                data[0]?.results[0]?.alternatives[0]?.transcript ?? ''
            ))
        );
    }
}