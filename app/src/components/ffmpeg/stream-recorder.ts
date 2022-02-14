import { Observable, interval, bindNodeCallback } from "rxjs";
import { spawn } from "child_process";
import { concatMap, filter, map, concatAll } from "rxjs/operators";
import * as glob from 'glob';
import * as dateFormat from 'dateformat';
import { AudioSegment } from "../../models/audio-segment";
import { readFile, unlink, mkdirSync, existsSync } from "fs";
import { ISource, ISample } from "../../interfaces/sample-interface";


export class StreamRecorder implements ISource<AudioSegment> {
    
    private readonly recordingDirectory: string;
    private readonly fileExtension: string;

    private readonly rxGlob: (globPattern: string) => Observable<string[]>;
    private readonly rxReadFile: (filename: string) => Observable<Buffer>;
    private readonly rxUnlink: (filename: string) => Observable<void>;

    constructor(streamSource: string, recordingDirectory: string='/root/recs/', fileExtension: string='.mp3') {
        this.recordingDirectory = recordingDirectory;
        this.fileExtension = fileExtension;
        
        if (!existsSync(this.recordingDirectory)) {
            mkdirSync(this.recordingDirectory);
        }
        const ffmpeg = spawn('ffmpeg', [
            // General settings
            '-hide_banner',
            '-nostats',
            '-loglevel', 'fatal',
        
            // Input
            '-i', streamSource,
        
            // Output
            '-c:a', 'mp3',
            '-f', 'segment',
            '-segment_time', '60',
            '-strftime', '1', `${this.recordingDirectory}%Y-%m-%dT%H:%M:%S${this.fileExtension}`
        ], {
            stdio: ["ignore", "ignore", process.stderr],
            env: {
                // Pass through any global env variables
                ...process.env,
                // Save a log file with loglevel=info to ffreport.log
                FFREPORT: 'file=ffmpeg-report.log:level=32'
            }
        });

        ffmpeg.on('exit', () => {
            throw new Error('Ffmpeg unexpectedly stopped. This is usually a transient network issue.');
        });

        // Bind some library functions into reactivex versions
        this.rxGlob = bindNodeCallback(glob);
        this.rxReadFile = bindNodeCallback(readFile);
        this.rxUnlink = bindNodeCallback(unlink);
    }

    private parseSample(source: string, fileName: string): ISample {
        const timestamp = fileName.substring(this.recordingDirectory.length, fileName.length - this.fileExtension.length);
        return {
            processChain: [source, 'ffmpeg'],
            timestamp: new Date(timestamp)
        };
    }
    private getFileName(sample: ISample): string {
        return `${this.recordingDirectory}${dateFormat(sample.timestamp, "yyyy-mm-dd'T'HH:MM:ss")}${this.fileExtension}`;
    }

    public getSamples(audioSources: string[], includePastData: boolean=false): Observable<ISample> {
        if (audioSources.length != 1) {
            throw new Error('Stream recorder can only load single stream being recorded');
        }

        if (includePastData) {
            throw new Error('Stream recorder is not able to fetch past data');
        }

        return interval(55 * 1e3).pipe(
            concatMap(() => this.rxGlob(`${this.recordingDirectory}*${this.fileExtension}`)),
            // When there are two files the older is complete
            filter(matches => matches.length >= 2),
            map(matches => {
                matches.sort();
                return matches.slice(0, matches.length - 1)
            }),
            concatAll(),
            map(newAudioFile => this.parseSample(audioSources[0], newAudioFile))
        );
    }

    public load(sample: ISample): Observable<AudioSegment> {
        const fileName = this.getFileName(sample);
        // read local file
        return this.rxReadFile(fileName).pipe(
            // parse as audioSegment
            map(data => AudioSegment.FromSource(
                sample,
                data
            )),
            concatMap(audioSample =>
                // delete file
                this.rxUnlink(fileName).pipe(
                    map(() => audioSample)
                )
            )
        );
    }

}