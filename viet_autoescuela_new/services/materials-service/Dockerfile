FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY services/materials-service/package.json services/materials-service/package.json

RUN npm ci

COPY services/materials-service services/materials-service

ENV NODE_ENV=production
EXPOSE 4005

CMD ["npm", "run", "start", "--workspace", "services/materials-service"]
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY services/materials-service/package.json services/materials-service/package.json

RUN npm ci

COPY services/materials-service services/materials-service

ENV NODE_ENV=production
EXPOSE 4005

CMD ["npm", "run", "start", "--workspace", "services/materials-service"]
