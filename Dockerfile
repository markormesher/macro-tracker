FROM node:dubnium

WORKDIR /macro-tracker

# dependencies
COPY ./private-packages ./private-packages
COPY package.json yarn.lock ./
RUN yarn install

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
