FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY services/user-service/package.json services/user-service/package.json

RUN npm ci

COPY services/user-service services/user-service

ENV NODE_ENV=production
EXPOSE 4003

CMD ["npm", "run", "start", "--workspace", "services/user-service"]
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY services/user-service/package.json services/user-service/package.json

RUN npm ci

COPY services/user-service services/user-service

ENV NODE_ENV=production
EXPOSE 4003

CMD ["npm", "run", "start", "--workspace", "services/user-service"]
