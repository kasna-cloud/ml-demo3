const processes = ['transcribe', 'analyse-sentiment', 'analyse-mentions'] as const;
const processors = ['gcp', 'opensource'] as const;
const inputs = ['fs'] as const;
const outputs = ['fs', 'postgres'] as const;

export type Process = typeof processes[number];
export type Processor = typeof processors[number];
export type Input = typeof inputs[number];
export type Output = typeof outputs[number];

export interface ValidProcessesRequiredConfiguration {
    sourceStages: number;
    processors: { [processor in Processor]?: string[] };
    inputs: { [input in Input]?: string[] };
    outputs: { [output in Output]?: string[] };
}

const filesystemAudio = [ 'AUDIO_DIRECTORY' ];
const filesystemTranscript = [ 'TRANSCRIPT_DIRECTORY' ];
const postgresDb = {
    'postgres': [
        'POSTGRESQL_HOST',
        'POSTGRESQL_DATABASE',
        'POSTGRESQL_USERNAME',
        'POSTGRESQL_PASSWORD'
    ]
}

export const ValidProcesses: { [process in Process]: ValidProcessesRequiredConfiguration } = {
    'transcribe': {
        sourceStages: 2,
        processors: {
            'gcp': [],
            'opensource': [ 'DEEPSPEECH_VERSION' ]
        },
        inputs: {
            'fs': filesystemAudio
        },
        outputs: {
            'fs': filesystemTranscript
        }
    },
    'analyse-sentiment': {
        sourceStages: 3,
        processors: {
            'gcp': [],
            'opensource': []
        },
        inputs: {
            'fs': filesystemTranscript
        },
        outputs: postgresDb
    },
    'analyse-mentions': {
        sourceStages: 3,
        processors: {
            'gcp': [],
            'opensource': []
        },
        inputs: {
            'fs': filesystemTranscript
        },
        outputs: postgresDb
    }
};