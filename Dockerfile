FROM node:16.14.2-alpine

WORKDIR /macro-tracker

# dependencies
COPY package.json yarn.lock ./
RUN yarn install && yarn cache clean

# source
COPY ./src ./src
COPY ./tsconfig.json ./webpack.config.js ./

# build
ARG BUILD_TYPE=production
RUN if [ $BUILD_TYPE = production ]; then yarn build; fi
RUN if [ $BUILD_TYPE = development ]; then yarn build-dev; fi

# run
EXPOSE 3000
CMD yarn start
