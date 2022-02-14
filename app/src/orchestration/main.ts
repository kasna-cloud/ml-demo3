import * as parseArgs from 'minimist';
import { RadioOptions } from './options';
import { concatMap } from 'rxjs/operators';
import { logStep } from '../helpers/step-logger';
import { createInput, createOutput } from './io';
import { createTransformer } from './processors';

const args = parseArgs(process.argv.slice(2));

// Parse and validate inputs
const radioOptions = new RadioOptions(args);
const validationErrors = radioOptions.validate();

if (validationErrors.length > 0) {
    console.error("Invalid options specified!")
    validationErrors.forEach(e => console.error(e));
    process.exit(1);
}

// Main setup
const input = createInput(radioOptions.input, radioOptions.process);
const output = createOutput(radioOptions.output, radioOptions.process);
const transform = createTransformer(radioOptions.process, radioOptions.processor);

const pipeline = input.getSamples(radioOptions.sources).pipe(
    concatMap(s => input.load(s)),
    logStep('Loaded'),
    concatMap(s => transform.transform(s)),
    logStep('Processed'),
    concatMap(s => output.save(s)),
    logStep('Saved'),
);

// Start!
pipeline.subscribe();
console.log(`>>> Started ${radioOptions.process} process! (${transform.processName})`);