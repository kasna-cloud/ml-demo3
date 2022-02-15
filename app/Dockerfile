FROM node:16-bullseye-slim

WORKDIR /root

COPY package.json package.json

RUN npm i

COPY src/ src/

ENTRYPOINT [ "npm", "run", "start", "--" ]