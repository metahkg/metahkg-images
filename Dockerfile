FROM node:18-alpine as build

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./

COPY . ./

RUN yarn install
RUN yarn build

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY --from=build /usr/src/app/dist ./dist

RUN yarn install

CMD yarn start
