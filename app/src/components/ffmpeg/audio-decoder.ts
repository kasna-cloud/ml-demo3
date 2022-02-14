import { ChildProcess, spawn } from "child_process";
import { fromEvent, Observable } from "rxjs";
import { map, take } from "rxjs/operators";


function initialiseFfmpegProcess(sampleRate: number): ChildProcess {
    return spawn('ffmpeg', [
        // General settings
        '-hide_banner',
        '-nostats',
        '-loglevel', 'fatal',

        // Input
        '-i', 'pipe:0',             // 0 for stdin, 1 for stdout, 2 for stderr

        // Output raw pipe
        '-vn',                      // Ignore any video channels in source
        '-codec:a', 'pcm_s16le',    // Encode into raw: signed, 16 bit, little endian
        '-ac', '1',                 // Only take first audio channel if multiple
        '-ar', sampleRate.toString(), // Resample to given sample rate
        '-f', 's16le',              // Format as: signed, 16 bit, little endian
        'pipe:1',                   // 0 for stdin, 1 for stdout, 2 for stderr
    ], {
        stdio: ["pipe", "pipe", process.stderr]
    });
}

export function decodeAudio(encodedAudio: Buffer, sampleRate: number=16000): Observable<Buffer> {
    const inference_start_time = process.hrtime();

    const decodedBuffers = new Array<Buffer>();
    const ffmpeg = initialiseFfmpegProcess(sampleRate);
    ffmpeg.stdout.on('data', (chunk) => decodedBuffers.push(chunk));
    
    ffmpeg.stdin.write(encodedAudio);
    ffmpeg.stdin.end();
    
    return fromEvent(ffmpeg, 'exit').pipe(
        take(1),
        map(() => {
            const data = Buffer.concat(decodedBuffers);
            
            ffmpeg.kill('SIGINT');
            ffmpeg.stdout.destroy();
            ffmpeg.stdin.destroy();
            ffmpeg.unref();

            const inference_end_time = process.hrtime(inference_start_time);
            const inference_duration = (inference_end_time[0] + inference_end_time[1] / 1e9);
        
            console.debug(`FFMPEG decode processing time: ${inference_duration.toPrecision(4)}s`);

            return data;
        })
    );
};