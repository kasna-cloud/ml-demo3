import { ITransformer, ISample } from "../interfaces/sample-interface";
import { Processor, Process } from "./config";
import { GcpSpeechToText } from "../components/gcp/speech-to-text";
import { GcpLanguageSentiment } from "../components/gcp/language-sentiment";
import { GcpLanguageMentions } from "../components/gcp/language-mentions";
import { DeepSpeechTranscriber } from "../components/opensource/deepspeech";
import { NaturalAnalyticsProcessor } from "../components/opensource/natural";
import { CompromiseAnalyticsProcessor } from "../components/opensource/compromise";

export function createTransformer(_process: Process, processor: Processor): ITransformer<ISample, ISample> {
    if (processor === 'gcp') {
        if (_process === 'transcribe') {
            return new GcpSpeechToText(
                process.env['GCP_SPEECHTOTEXT_LANGUAGE']
            );
        } else if (_process === 'analyse-sentiment') {
            return new GcpLanguageSentiment();
        } else if (_process === 'analyse-mentions') {
            return new GcpLanguageMentions();
        }
    } else if (processor === 'opensource') {
        if (_process === 'transcribe') {
            return new DeepSpeechTranscriber(
                process.env['DEEPSPEECH_VERSION']
            );
        } else if (_process === 'analyse-sentiment') {
            return new NaturalAnalyticsProcessor(
                "0.6.3"
            );
        } else if (_process === 'analyse-mentions') {
            return new CompromiseAnalyticsProcessor(
                "13.1.1"
            );
        }
    }
}