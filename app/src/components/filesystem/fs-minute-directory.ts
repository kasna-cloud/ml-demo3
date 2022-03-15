import { Observable, interval, bindNodeCallback, merge } from "rxjs";
import { map, mergeAll, startWith, switchMap, filter, tap } from "rxjs/operators";
import * as dateFormat from 'dateformat';
import { ISample } from "../../interfaces/sample-interface";
import { readFile, writeFile } from "fs";
import * as glob from 'glob';


export abstract class FSMinuteDirectory {
    
    private readonly directory: string;
    private readonly fileExtension: string;
    private readonly minimumDelay: number;

    private mostRecentSamples: { [source: string]: ISample };

    private readonly rxGlob: (globPattern: string) => Observable<string[]>;
    private readonly rxReadFile: (filename: string) => Observable<Buffer>;
    private readonly rxWriteFile: (filename: string, data: Buffer) => Observable<void>;

    constructor(
        directory: string,
        fileExtension: string,
        minimumDelay: number = 3,
    ) {
        this.directory = directory;
        this.fileExtension = fileExtension;
        this.minimumDelay = minimumDelay;
        this.mostRecentSamples = {};

        // Bind some library functions into reactivex versions
        this.rxGlob = bindNodeCallback(glob);
        this.rxReadFile = bindNodeCallback(readFile);
        this.rxWriteFile = bindNodeCallback(writeFile);
    }

    private getSource(processChain: string[]): string {
        return processChain.join(':');
    }
    private parseProcessChain(source: string): string[] {
        return source.split(':');
    }

    private getPath(sample: ISample): string {
        return `${this.directory}/${this.getSource(sample.processChain)}/${dateFormat(sample.timestamp, "isoUtcDateTime")}${this.fileExtension}`;
    }
    private parseSample(path: string): ISample {
        const pathComponents = path.split('/');
        const pathPrefix = pathComponents.slice(-2, -1)[0];
        const timestampExtStr = pathComponents.slice(-1)[0];
        const timestampStr = timestampExtStr.split('.')[0];
        return {
            processChain: this.parseProcessChain(pathPrefix),
            timestamp: new Date(timestampStr)
        };
    }

    protected uploadSample(sample: ISample, data: Buffer): Observable<void> {
        return this.rxWriteFile(this.getPath(sample), data);
    }

    protected loadSample(sample: ISample): Observable<Buffer> {
        return this.rxReadFile(this.getPath(sample));
    }

    protected pollForNewSamples(sources: string[], includePastData: boolean=false, pollingFrequency: number=55): Observable<ISample> {
        this.mostRecentSamples = sources.reduce<{ [source: string]: ISample }>((all, source) => {
            all[source] = {
                processChain: this.parseProcessChain(source),
                timestamp: includePastData ? new Date(2020, 0, 1) : new Date()
            }
            return all;
        }, {});

        return interval(pollingFrequency * 1e3).pipe(
            // Poll immediately upon starting
            startWith(0),
            tap(() => console.debug("Polling FS for input files")),
            switchMap(() =>
                merge(
                    ...sources.map(source =>
                        this.rxGlob(`${this.directory}/${source}/*${this.fileExtension}`)
                    )
                ).pipe(
                    map(paths => {
                        const samples = paths.map(p => this.parseSample(p));
                        // We sort here to emit the oldest samples across sources first
                        samples.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());
                        console.debug(`Found ${samples.length} input files during poll`);
                        return samples;
                    }),
                )
            ),
            mergeAll(),
            filter(sample => {
                const source = this.getSource(sample.processChain);
                const minimumDelay = new Date();
                minimumDelay.setMinutes(minimumDelay.getMinutes() - this.minimumDelay)
                if (sample.timestamp > minimumDelay) {
                    return false;
                }
                if (sample.timestamp > this.mostRecentSamples[source].timestamp) {
                    this.mostRecentSamples[source] = sample;
                    return true;
                }
                return false;
            }),
        );
    }
}