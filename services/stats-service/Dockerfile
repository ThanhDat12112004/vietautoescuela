FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY services/stats-service/package.json services/stats-service/package.json

RUN npm ci

COPY services/stats-service services/stats-service

ENV NODE_ENV=production
EXPOSE 4004

CMD ["npm", "run", "start", "--workspace", "services/stats-service"]
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY services/stats-service/package.json services/stats-service/package.json

RUN npm ci

COPY services/stats-service services/stats-service

ENV NODE_ENV=production
EXPOSE 4004

CMD ["npm", "run", "start", "--workspace", "services/stats-service"]
