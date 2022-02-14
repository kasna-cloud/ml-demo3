# Media Monitoring of Broadcast Radio

## Background

The City of Melbourne regularly monitors media channels to understand how the general public is responding to marketing campaigns and news related to the City in Melbourne in general. Automatic monitoring of social media and online news is being managed by an existing solution, but the monitoring of broadcast radio, especially talk-back radio, is manual and ad-hoc. 

## Solution Overview

Eliiza has developed a solution for The City of Melbourne to automatically monitor broadcast radio. This solution provides summary reports of most discussed daily and weekly topics across the various talk-back channels as well as the sentiment associated with each topic scored from -1 (negative) through to 1 (positive) with neutral sentiment at 0. Additionally, alerts are able to configured to notify the PR function within the City of Melbourne when specific topics are being discussed within a few minutes of them occurring. This provides the organistion with the ability review the audio of what was being discussed and to quickly respond to topics as they are being discussed live on-air. 

## Solution Detail

The technical solution makes use of the Google Cloud AI Services, Speech API and Natural Language API. The diagram below shows the overall system architecture. 

![Radio Sentiment Monitoring Architecture](RadioSentimentMonitoring.png)

* **Audio Stream Capture** - A Compute Engine instance which runs a process to capture each audio stream and delivers audio in snippets (currently 60 second pieces of audio) into the Cloud Storage location
* **Audio Snippets** - Raw audio snippets that can been stored in .flac format so they are ready to be processed
* **Process Audio** - A Cloud Function that is triggered from events in Cloud Storage. When a new audio snippet is stored in Cloud Storage the function converts that audio to text using the Google Speech API. The text response is then passed to the Natural Language API to extract conversation topics and their associated sentiment. These topic/sentiment pairs are then stored in the Topic Store along with the timestamp they occurred and the audio channel they were sourced from. 
* **Topic Store** - A Cloud SQL MySQL instance that acts as a time-series store of topic/sentiment events per audio channel
* **Grafana** - A dashboard tool running on Google Kubernetes Engine that is able to provide various flexible data visualisations and alerting on time-series data. In this instance it is being used to display real-time topics being discussed, the top 10 topics, and their associated sentiments, all within a time-window selected by the end-user

### Audio Capture Process

The Audio Capture Process makes use of the `ffmpeg` command line tool to be able to capture audio streams and store regular audio snippets in the `.flac` format appropriate for Google Speech API. 

The sample command below is what is used to capture the ABC 3LO radio live-stream. It firstly segments the audio into 60 second seconds and stores it as a `.flac` file with a timestamp filename. Additional it stores hourly snippets in `mp3` format. The smaller snippets are to be processed and discarded, while the longer `mp3` files are retained to enable later review of the audio at a point in time to help understand the context of a topic being discussed. 

The files are stored in Cloud Storage through the use of the `Cloud Storage FUSE` which supports mounting of Cloud storage buckets as file systems.  

`ffmpeg -i http://live-radio01.mediahubaustralia.com/3LRW/mp3/ -c:a flac -f segment -segment_time 60 -s
trftime 1 "3LO/%Y-%m-%d_%H-%M-%S.flac" -c:a mp3 -f segment -segment_time 3600 -strftime 1 "3LO-long/%Y-%m-%d_%H-%M-
%S.mp3"`

### Topic Dashboard

The image below shows the dashboard running live against ABC Radio 3LO from the last 6 hours and refreshing every minute. The list on the right contains the topics in real-time along with their associated sentiment. The list on the left aggregates the topics over the viewed period and shows the top ten. During this particular morning of talk-back radio China and New Zealand were discussed in detail. The graph below gives a simple overall feel that the sentiment of topics is generally more negative than positive (as you would expect of talk-back radio). 

![radio-dashboard.png](radio-dashboard.png)

## Solution Challenges

### Cost

The cost to monitor a single audio stream around the clock (24/7) is approximately $1,000 USD with the bulk of this cost coming from Speech API. Several approaches have been explored to make this system more cost effective:

* Only run the system during peak discussion periods (ie. 7am - 10am)
* Provide the service to other customers to amortise the cost 
* Explore moving away from Speech API to a prebuilt speech model or training a new model

The current has been to only run the system for short periods of time during active campaigns. 

### Model Evaluation

In order to evaluate the effectiveness of the system, several snippets of audio were examined and evaluated across various dimensions:

* **Speech to Text** - how effective was the system for converting the audio into text? While the conversation was not always 100% accurate, in general the main elements of the conversation were correctly transcribed to a level that supported downstream identification of topics. Sample of several audio snippets saw a 95% accuracy of conversation translated into text.
* **Topic Identification** - how effective was the system for identifying topics within text? The Natural Language API was able to identify the main topics within the converted text, however due to the conversation style being quite fluid as opposed to formal structured text, quite often the system identified spurious topics. These can quite easily be ignored and instead focusing in on topics that are repeated several times within a short time.
* **Sentiment Analysis** - While the individual data points of the sentiment of each mention of a topic seem almost arbitrary, when viewed in the aggregate the sentiment of topics proved insightful. As the system is further used, measuring sentiment of key topics and comparing them across radio stations will be a key insight. More data is required to be able to determine the effectiveness of this measure.

### Further Work

While the current system is proving useful, several next steps have been identified to further develop the solution. The current system can be used as a baseline to determine if the ideas below prove to be useful and increase the overall value to the customer. 

* Explore a cheaper speech model without reducing quality
* Identify additional clients to amortise the cost of the system, especially the speech API
* Build out a custom interface beyond the dashboard to support listening to audio captured around topic
* Bring in additional media sources across social media and television


# eliiza/radio-monitor

This docker image converts an audio radio stream into t

---

## Usage

The image requires the following environment variables:

1. `RADIO_STATION_NAME`: Name of radio station to record (used in filepath). Cannot contain underscores or backslashes.
1. `S3_BUCKET`: Name of s3 bucket to save mp3 files to
2. `AWS_ACCESS_KEY_ID`: AWS access key id, must have permission to write to specified bucket
3. `AWS_SECRET_ACCESS_KEY`: AWS access secret key, must have permission to write to specified bucket
1. `PGUSER`: Username for postgreSQL database
1. `PGDATABASE`: PostgreSQL database
1. `PGPASSWORD`: PostgreSQL database password

The image has the following optional environment variables:
1. `SAVE_FILE_FREQUENCY`: How often to save text stream to files in seconds. Defaults to 65 seconds
2. `PGHOST`: PostgreSQL hostname. Defaults to 'localhost'
3. `PGPORT`: PostgreSQL post. Defaults to 5432

It is recommended to run with automatic restarts, in case the stream drops:

* `--restart always`

A complete example (you still need to edit the AWS keys):

```sudo docker run -d --restart always  -e RADIO_STATION_NAME=3L0 -e RADIO_STATION_SRC=http://live-radio01.mediahubaustralia.com/3LRW/mp3/ eliiza/radio-monitor```

## Build

`docker build -t eliiza/radio-streamer .`


## Future Improvements

* https://github.com/topics/automatic-speech-recognition
* https://github.com/hirofumi0810/neural_sp


# create a persistent volume for your data in /var/lib/grafana (database and plugins)
docker volume create grafana-storage

# start grafana
docker run -d --restart always \
    -p 80:3000 \
    --name=grafana \
    -e GF_SERVER_ENABLE_GZIP=true \
    -e GF_AUTH_ANONYMOUS_ENABLED=true \
    -e GF_AUTH_ANONYMOUS_ORG_NAME=Eliiza \
    -e GF_PANELS_DISABLE_SANITIZE_HTML=true \
    -v grafana-storage:/var/lib/grafana \
    grafana/grafana