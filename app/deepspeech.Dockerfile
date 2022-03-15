FROM node:12-bullseye-slim as model
ARG DEEPSPEECH_VERSION=0.9.3

WORKDIR /root/${DEEPSPEECH_VERSION}

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        ca-certificates \
        curl

RUN curl -LOO https://github.com/mozilla/DeepSpeech/releases/download/v${DEEPSPEECH_VERSION}/deepspeech-${DEEPSPEECH_VERSION}-models.{tflite,pbmm,scorer}

FROM node:12-bullseye-slim
ARG DEEPSPEECH_VERSION=0.9.3

WORKDIR /root

RUN mkdir /deepspeechmodels
COPY --from=model /root/${DEEPSPEECH_VERSION} /deepspeechmodels

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        musl-dev \
        python3 \
        python3-numpy \
        ffmpeg \
    && ln -s /usr/lib/x86_64-linux-musl/libc.so /lib/libc.musl-x86_64.so.1

ENV DEEPSPEECH_VERSION=${DEEPSPEECH_VERSION}

COPY package.json package.json

RUN npm i

COPY src/ src/

ENTRYPOINT [ "npm", "run", "start", "--" ]