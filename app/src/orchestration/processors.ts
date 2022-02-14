import { ITransformer, ISample } from "../interfaces/sample-interface";
import { Processor, Process } from "./config";
import { AwsTranscribe } from "../components/aws/transcribe";
import { AwsComprehendSentiment } from "../components/aws/comprehend-sentiment";
import { AwsComprehendMentions } from "../components/aws/comprehend-mentions";
import { AzureSpeechToText } from "../components/azure/speech-to-text";
import { AzureTextAnalyticsSentiment } from "../components/azure/text-analytics-sentiment";
import { AzureTextAnalyticsMentions } from "../components/azure/text-analytics-mentions";
import { GcpSpeechToText } from "../components/gcp/speech-to-text";
import { GcpLanguageSentiment } from "../components/gcp/language-sentiment";
import { GcpLanguageMentions } from "../components/gcp/language-mentions";
import { DeepSpeechTranscriber } from "../components/deepspeech/deepspeech";
import { NaturalAnalyticsProcessor } from "../components/npm-nlp/natural";
import { CompromiseAnalyticsProcessor } from "../components/npm-nlp/compromise";

export function createTransformer(_process: Process, processor: Processor): ITransformer<ISample, ISample> {
    if (processor === 'aws') {
        if (_process === 'transcribe') {
            return new AwsTranscribe(
                process.env['AWS_ACCESS_KEY_ID'],
                process.env['AWS_SECRET_ACCESS_KEY'],
                process.env['AWS_TRANSCRIBE_REGION'],
                process.env['AWS_TRANSCRIBE_AUDIO_FORMAT'],
                process.env['AWS_TRANSCRIBE_LANGUAGE'],
                process.env['AWS_TRANSCRIBE_PENDING_BUCKET']
            );
        } else if (_process === 'analyse-sentiment') {
            return new AwsComprehendSentiment(
                process.env['AWS_ACCESS_KEY_ID'],
                process.env['AWS_SECRET_ACCESS_KEY'],
                process.env['AWS_TRANSCRIBE_REGION'],
                process.env['AWS_TRANSCRIBE_LANGUAGE']
            );
        } else if (_process === 'analyse-mentions') {
            return new AwsComprehendMentions(
                process.env['AWS_ACCESS_KEY_ID'],
                process.env['AWS_SECRET_ACCESS_KEY'],
                process.env['AWS_TRANSCRIBE_REGION'],
                process.env['AWS_TRANSCRIBE_LANGUAGE']
            );
        }
    } else if (processor === 'azure') {
        if (_process === 'transcribe') {
            return new AzureSpeechToText(
                process.env['AZURE_SUBSCRIPTION_KEY']
            );
        } else if (_process === 'analyse-sentiment') {
            return new AzureTextAnalyticsSentiment(
                process.env['AZURE_TEXT_ANALYTICS_ENDPOINT'],
                process.env['AZURE_TEXT_ANALYTICS_KEY']
            );
        } else if (_process === 'analyse-mentions') {
            return new AzureTextAnalyticsMentions(
                process.env['AZURE_TEXT_ANALYTICS_ENDPOINT'],
                process.env['AZURE_TEXT_ANALYTICS_KEY']
            );
        }
    } else if (processor === 'gcp') {
        if (_process === 'transcribe') {
            return new GcpSpeechToText(
                process.env['GCP_SPEECHTOTEXT_LANGUAGE']
            );
        } else if (_process === 'analyse-sentiment') {
            return new GcpLanguageSentiment();
        } else if (_process === 'analyse-mentions') {
            return new GcpLanguageMentions();
        }
    } else if (processor === 'deepspeech') {
        return new DeepSpeechTranscriber(
            process.env['DEEPSPEECH_VERSION']
        );
    } else if (processor === 'naturaljs') {
        return new NaturalAnalyticsProcessor(
            "0.6.3"
        );
    } else if (processor === 'compromisejs') {
        return new CompromiseAnalyticsProcessor(
            "13.1.1"
        );
    }
}