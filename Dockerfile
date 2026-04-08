FROM node:22-alpine

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm i -g serve

COPY . .

ARG VITE_API_URL
ARG VITE_API_KEY
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env && echo "VITE_API_KEY=${VITE_API_KEY}" >> .env

RUN npm run build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]