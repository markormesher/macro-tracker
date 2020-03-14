FROM node:dubnium

WORKDIR /macro-tracker

# dependencies
ARG NPM_FONT_AWESOME_TOKEN
COPY package.json .yarnrc yarn.lock .npmrc ./
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
