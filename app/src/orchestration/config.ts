const processes = ['transcribe', 'analyse-sentiment', 'analyse-mentions'] as const;
const processors = ['deepspeech', 'aws', 'azure', 'gcp', 'compromisejs', 'naturaljs'] as const;
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

const awsCredentials = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'S3_BUCKET'
];
const azureTextAnalyticsCredentials = [
    'AZURE_TEXT_ANALYTICS_ENDPOINT',
    'AZURE_TEXT_ANALYTICS_KEY'
]
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
            'deepspeech': [ 'DEEPSPEECH_VERSION' ],
            'aws': awsCredentials.concat([ 'AWS_TRANSCRIBE_PENDING_BUCKET' ]),
            'azure': [ 'AZURE_SUBSCRIPTION_KEY' ],
            'gcp': [ 'GOOGLE_APPLICATION_CREDENTIALS' ]
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
            'aws': awsCredentials,
            'azure': azureTextAnalyticsCredentials,
            'gcp': [],
            'naturaljs': []
        },
        inputs: {
            'fs': filesystemTranscript
        },
        outputs: postgresDb
    },
    'analyse-mentions': {
        sourceStages: 3,
        processors: {
            'aws': awsCredentials,
            'azure': azureTextAnalyticsCredentials,
            'gcp': [],
            'compromisejs': []
        },
        inputs: {
            'fs': filesystemTranscript
        },
        outputs: postgresDb
    }
};