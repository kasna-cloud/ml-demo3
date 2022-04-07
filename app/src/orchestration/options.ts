import * as parseArgs from 'minimist';
import { Process, Processor, Input, Output, ValidProcesses } from './config';

export class RadioOptions {
    readonly args: parseArgs.ParsedArgs;
    readonly sources: string[];
    readonly process: Process;
    readonly processor: Processor;
    readonly input?: Input;
    readonly output: Output;

    constructor(args: parseArgs.ParsedArgs) {
        this.args = args;
        const _process = this.args._[0];

        if (_process in ValidProcesses) {
            this.process = _process as Process;
        } else {
            throw new Error(`Invalid process ${_process}`);
        }

        const sources = this.args['sources'] || process.env['SOURCES'];
        if (!sources) {
            throw new Error('No source(s) specified');
        } else {
            this.sources = sources.split(',');
        }

        this.processor = this.args._[1] as Processor;
        this.input = this.args['input'] || null;
        this.output = this.args['output'];
    }

    public validate(): string[] {
        const errors: string[] = [];
        const valid = ValidProcesses[this.process];

        if (this.sources.some(s => s.split(':').length !== valid.sourceStages)) {
            errors.push(`"${this.process}" requires sources to have ${valid.sourceStages} previous steps`);
            this.sources.filter(s => s.split(':').length !== valid.sourceStages).forEach(source => {
                errors.push(`source "${source}" has ${source.split(':').length} previous steps`);
            });
        }
        
        if (!(this.processor in valid.processors)) {
            errors.push(`"${this.processor}" is not a valid processor for "${this.process}". Must be one of [${Object.keys(valid.processors)}].`);
        } else {
            valid.processors[this.processor].forEach(requiredVar => {
                if (!process.env[requiredVar]) {
                    errors.push(`"${this.processor} requires ${requiredVar} to be set"`);
                }
            });
        }

        if (Object.entries(valid.inputs).length > 0 || !!this.input) {
            if (!(this.input in valid.inputs)) {
                if (Object.keys(valid.inputs).length > 0) {
                    errors.push(`"${this.input}" is not a valid input for "${this.process}". Must be one of [${Object.keys(valid.inputs)}].`);
                } else {
                    errors.push(`"${this.process}" does not support additional inputs.`);
                }
            } else {
                valid.inputs[this.input].forEach(requiredVar => {
                    if (!process.env[requiredVar]) {
                        errors.push(`"${this.input} requires ${requiredVar} to be set"`);
                    }
                });
            }
        }
        
        if (!(this.output in valid.outputs)) {
            errors.push(`"${this.output}" is not a valid output for "${this.process}". Must be one of [${Object.keys(valid.outputs)}].`);
        } else {
            valid.outputs[this.output].forEach(requiredVar => {
                if (!process.env[requiredVar]) {
                    errors.push(`"${this.output} requires ${requiredVar} to be set"`);
                }
            });
        }

        return errors;
    }
}