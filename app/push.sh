az acr login -n eliiza \
&& docker push eliiza.azurecr.io/radio-monitor:latest-base \
&& docker push eliiza.azurecr.io/radio-monitor:2.1.14-base \
&& docker push eliiza.azurecr.io/radio-monitor:latest-deepspeech_0.9.3 \
&& docker push eliiza.azurecr.io/radio-monitor:2.1.14-deepspeech_0.9.3