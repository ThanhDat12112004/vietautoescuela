FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY services/media-service/package.json services/media-service/package.json

RUN npm ci

COPY services/media-service services/media-service

ENV NODE_ENV=production
EXPOSE 4002

CMD ["npm", "run", "start", "--workspace", "services/media-service"]
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY services/media-service/package.json services/media-service/package.json

RUN npm ci

COPY services/media-service services/media-service

ENV NODE_ENV=production
EXPOSE 4002

CMD ["npm", "run", "start", "--workspace", "services/media-service"]
