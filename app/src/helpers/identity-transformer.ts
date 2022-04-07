import { ISample, ITransformer } from "../interfaces/sample-interface";
import { Observable, of } from "rxjs";

export class IdentityTransformer<T extends ISample> implements ITransformer<T, T> {
    readonly processName: string;

    constructor() {
        this.processName = 'identity';
    }

    public transform(input: T): Observable<T> {
        return of(input);
    }
}