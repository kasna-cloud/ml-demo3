import { MonoTypeOperatorFunction, pipe } from "rxjs";
import { tap } from "rxjs/operators";
import { ISample } from "../interfaces/sample-interface";
import * as dateFormat from 'dateformat';

export function logStep<T extends ISample>(logMessage: string): MonoTypeOperatorFunction<T> {
    return pipe(
        tap(sample => {
            const timestamp = dateFormat(sample.timestamp, "isoUtcDateTime");
            const source = `\x1b[33m${sample.processChain[0]}\x1b[0m`;
            const processes = sample.processChain.slice(1).map(process => `\x1b[36m${process}\x1b[0m`);
            console.log(`[${timestamp}] ${source}:${processes.join(':')} > ${logMessage}`);
        })
    );
}