import { Observable, of } from 'rxjs';
import { AudioSegment } from '../../models/audio-segment';
import { Transcript } from '../../models/transcript';
import { decodeAudio } from '../ffmpeg/audio-decoder';
import { map } from 'rxjs/operators';
import { ITransformer } from '../../interfaces/sample-interface';

import { Model as Model09TFType } from 'deepspeech09-tf';
import { Model as Model09Type } from 'deepspeech09';
import { Model as Model07TFType } from 'deepspeech07-tf';
import { Model as Model07Type } from 'deepspeech07';


export class DeepSpeechTranscriber implements ITransformer<AudioSegment, Transcript> {

    public processName: string;
    private deepspeechVersion: string;
    private deepspeechModel: Model09Type | Model09TFType | Model07Type | Model07TFType;

    constructor(deepspeechVersion: string) {
        this.deepspeechVersion = deepspeechVersion;
        this.processName = `deepspeech-${this.deepspeechVersion}`;
        const tfEnabled = Boolean(process.env["DEEPSPEECH_TFLITE"]);

        let DeepSpeech = null;

        if (this.deepspeechVersion.startsWith('0.9.')) {
            if (tfEnabled) {
                console.log('Initialising Deepspeech in version 0.9.* mode with TF Lite enabled');
                DeepSpeech = require('deepspeech09-tf');
            } else {
                console.log('Initialising Deepspeech in version 0.9.* mode with TF Lite disabled');
                DeepSpeech = require('deepspeech09');
            }
        } else if (this.deepspeechVersion.startsWith('0.7.')) {
            if (tfEnabled) {
                console.log('Initialising Deepspeech in version 0.7.* mode with TF Lite enabled');
                DeepSpeech = require('deepspeech07-tf');
            } else {
                console.log('Initialising Deepspeech in version 0.7.* mode with TF Lite disabled');
                DeepSpeech = require('deepspeech07');
            }
        } else {
            console.log(`Deepspeech version ${this.deepspeechVersion} is not supported.`);
            throw new Error('Unsupported Deepspeech version');
        }
        
        const protocolBufferPath = `/deepspeechmodels/deepspeech-${this.deepspeechVersion}-models.${tfEnabled ? 'tflite' : 'pbmm'}`;
        const scorerPath = `/deepspeechmodels/deepspeech-${this.deepspeechVersion}-models.scorer`;

        console.log(`Loading protocol buffer from: ${protocolBufferPath}`);
        const model = new DeepSpeech.Model(protocolBufferPath);
        console.log(`Loading scorer from: ${scorerPath}`);
        model.enableExternalScorer(scorerPath);

        this.deepspeechModel = model;

        console.log(`Successfully initialised DeepSpeech ${this.deepspeechVersion}`);
    }

    public transform(audioSegment: AudioSegment): Observable<Transcript> {
        return decodeAudio(audioSegment.data).pipe(
            map(decodedAudio => {
                const inference_start_time = process.hrtime();

                const text = this.deepspeechModel.stt(decodedAudio);
                
                const inference_end_time = process.hrtime(inference_start_time);
                const inference_duration = (inference_end_time[0] + inference_end_time[1] / 1e9);

                console.debug(`DeepSpeech inference processing time: ${inference_duration.toPrecision(4)}s`);

                return Transcript.FromAudio(
                    audioSegment,
                    this.processName,
                    text
                );
            })
        );
    }
}