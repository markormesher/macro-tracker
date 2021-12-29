FROM node:dubnium

WORKDIR /macro-tracker

# dependencies
COPY ./private-packages ./private-packages
COPY package.json-versionless .yarnrc yarn.lock ./
RUN mv package.json-versionless package.json
RUN yarn install
COPY package.json ./
RUN yarn install

# source
COPY ./docker ./docker
COPY ./src/commons ./src/commons
COPY ./src/api ./src/api
COPY ./tsconfig.json ./tsconfig.api*.json ./

# build
ARG BUILD_TYPE=production
RUN if [ $BUILD_TYPE = production ]; then yarn build-api; fi
RUN if [ $BUILD_TYPE = development ]; then yarn build-api-dev; fi

# run
EXPOSE 3000
ENTRYPOINT ["./docker/api/docker-entrypoint.sh"]
CMD yarn start-api
