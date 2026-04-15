FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY services/quiz-service/package.json services/quiz-service/package.json

RUN npm ci

COPY services/quiz-service services/quiz-service

ENV NODE_ENV=production
EXPOSE 4001

CMD ["npm", "run", "start", "--workspace", "services/quiz-service"]
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY services/quiz-service/package.json services/quiz-service/package.json

RUN npm ci

COPY services/quiz-service services/quiz-service

ENV NODE_ENV=production
EXPOSE 4001

CMD ["npm", "run", "start", "--workspace", "services/quiz-service"]
