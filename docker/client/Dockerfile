FROM node:dubnium

WORKDIR /macro-tracker

# dependencies
COPY ./assets ./assets
COPY package.json-versionless .yarnrc yarn.lock ./
RUN mv package.json-versionless package.json
RUN yarn install
COPY package.json ./
RUN yarn install

# source
COPY ./docker ./docker
COPY ./src/commons ./src/commons
COPY ./src/client ./src/client
COPY ./tsconfig.json ./tsconfig.client*.json ./webpack.config.js ./

# build
ARG BUILD_TYPE=production
RUN if [ $BUILD_TYPE = production ]; then yarn build-client; fi
RUN if [ $BUILD_TYPE = development ]; then yarn build-client-dev; fi

# run
EXPOSE 3001
ENTRYPOINT ["./docker/client/docker-entrypoint.sh"]
CMD yarn start-client
