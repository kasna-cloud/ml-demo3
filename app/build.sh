docker build \
    --tag gcr.io/ml-spec-demo-3-sandbox/radio-monitor:latest-base \
    --tag gcr.io/ml-spec-demo-3-sandbox/radio-monitor:2.1.14-base \
        -f dockerfiles/base.Dockerfile . \
&& docker build \
    --tag gcr.io/ml-spec-demo-3-sandbox/radio-monitor:latest-deepspeech_0.9.3 \
    --tag gcr.io/ml-spec-demo-3-sandbox/radio-monitor:2.1.14-deepspeech_0.9.3 \
    --build-arg DEEPSPEECH_VERSION=0.9.3 \
        -f dockerfiles/deepspeech.Dockerfile .
