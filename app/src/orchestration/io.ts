import { SentimentTable } from "../components/postgres/sentiment-table";
import { MentionsTable } from "../components/postgres/mentions-table";
import { ISource, ISample, ISink } from "../interfaces/sample-interface";
import { Input, Process, Output } from "./config";
import { FSAudioDirectory } from "../components/filesystem/fs-audio-directory";
import { FSTranscriptDirectory } from "../components/filesystem/fs-transcript-directory";


const createFSAudioDirectory = () => new FSAudioDirectory(
    process.env['AUDIO_DIRECTORY']
);

const createFSTranscriptDirectory = () => new FSTranscriptDirectory(
    process.env['TRANSCRIPT_DIRECTORY']
);


export function createInput(input: Input, _process: Process): ISource<ISample> {
    if (input === 'fs' && _process === 'transcribe') {
        return createFSAudioDirectory();
    } else if (input === 'fs' && (_process === 'analyse-sentiment' || _process === 'analyse-mentions')) {
        return createFSTranscriptDirectory();
    } else {
        throw Error(`Unknown input '${input}'`)
    }
}

export function createOutput(output: Output, _process: Process): ISink<ISample> {
    if (output === 'fs' && _process === 'transcribe') {
        return createFSTranscriptDirectory();
    } else if (output === 'postgres' && _process === 'analyse-mentions') {
        return new MentionsTable(
            process.env['POSTGRESQL_HOST'],
            process.env['POSTGRESQL_DATABASE'],
            process.env['POSTGRESQL_USERNAME'],
            process.env['POSTGRESQL_PASSWORD']
        );
    } else if (output === 'postgres' && _process === 'analyse-sentiment') {
        return new SentimentTable(
            process.env['POSTGRESQL_HOST'],
            process.env['POSTGRESQL_DATABASE'],
            process.env['POSTGRESQL_USERNAME'],
            process.env['POSTGRESQL_PASSWORD']
        );
    }    
}