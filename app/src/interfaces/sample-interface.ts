import { Observable } from "rxjs";

export interface ISample {
    readonly processChain: string[];
    readonly timestamp: Date;
}

export interface ISource<T extends ISample> {
    getSamples(sources: string[]): Observable<ISample>;
    getSamples(sources: string[], includePastData: boolean): Observable<ISample>;
    load(sample: ISample): Observable<T>;
}

export interface ITransformer<T extends ISample, U extends ISample> {
    processName: string;
    transform(input: T): Observable<U>;
}

export interface ISink<T extends ISample> {
    save(sample: T): Observable<T>;
}