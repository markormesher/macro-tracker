FROM node:dubnium

WORKDIR /macro-tracker

# dependencies
COPY ./private-packages ./private-packages
COPY package.json yarn.lock ./
RUN yarn install

# source
COPY ./docker ./docker
COPY ./src ./src
COPY ./tsconfig.json ./tsconfig.api*.json ./webpack.config.js ./

# build
ARG BUILD_TYPE=production
RUN if [ $BUILD_TYPE = production ]; then yarn build; fi
RUN if [ $BUILD_TYPE = development ]; then yarn build-dev; fi

# run
EXPOSE 3000
ENTRYPOINT ["./docker/docker-entrypoint.sh"]
CMD yarn start
