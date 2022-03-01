FROM node:dubnium

WORKDIR /macro-tracker

# dependencies
ARG PRIVATE_PACKAGE_REPO PRIVATE_PACKAGE_REPO_TOKEN
COPY ./.scripts/get-private-packages.sh ./.scripts/
COPY package.json yarn.lock ./
RUN yarn get-private-packages
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
