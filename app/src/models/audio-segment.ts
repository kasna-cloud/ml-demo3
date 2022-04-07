import { ISample } from "../interfaces/sample-interface";

export class AudioSegment implements ISample {
    public readonly processChain: string[];
    public readonly timestamp: Date;
    public readonly data: Buffer;

    private constructor(processChain: string[], timestamp: Date, data: Buffer) {
        this.processChain = processChain;
        this.timestamp = timestamp;
        this.data = data;
    }

    public static FromRecorder(streamName: string, recordedBy: string, timestamp: Date, data: Buffer): AudioSegment {
        return new AudioSegment(
            [streamName, recordedBy],
            timestamp,
            data
        );
    }

    public static FromSource(sample: ISample, data: Buffer): AudioSegment {
        return new AudioSegment(
            sample.processChain,
            sample.timestamp,
            data
        );
    }

    // public static FromFile(fileName: string, data: Buffer): AudioSegment {
    //     const [processChainStr, timestampExtStr] = fileName.split('/');
    //     const processChain = processChainStr.split(':');
    //     const timestampStr = timestampExtStr.split('.')[0];
    //     return new AudioSegment(
    //         processChain,
    //         new Date(timestampStr),
    //         data
    //     );
    // }
}