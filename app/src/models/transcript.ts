import { ISample } from "../interfaces/sample-interface";
import { AudioSegment } from "./audio-segment";

export class Transcript implements ISample {
    public readonly processChain: string[];
    public readonly timestamp: Date;
    public readonly text: string;

    private constructor(
        processChain: string[],
        timestamp: Date,
        text: string
    ) {
        this.processChain = processChain;
        this.timestamp = timestamp;
        this.text = text;
    }

    public static FromAudio(sourceAudioSegment: AudioSegment, transcribedBy: string, text: string): Transcript {
        const processChain = [...sourceAudioSegment.processChain, transcribedBy];
        return new Transcript(
            processChain,
            sourceAudioSegment.timestamp,
            text
        );
    }

    public static FromSource(sample: ISample, json: JSON): Transcript {
        return new Transcript(
            sample.processChain,
            sample.timestamp,
            json['text']
        );
    }

    // public static FromFile(json: any): Transcript {
    //     return new Transcript(
    //         json['processChain'],
    //         json['timestamp'],
    //         json['text']
    //     );
    // }
}