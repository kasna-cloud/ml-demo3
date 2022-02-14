FROM node:12-buster-slim

WORKDIR /root

COPY package.json package.json

RUN npm i

COPY src/ src/

ENTRYPOINT [ "npm", "run", "start", "--" ]