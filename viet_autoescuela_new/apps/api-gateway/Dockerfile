FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api-gateway/package.json apps/api-gateway/package.json

RUN npm ci

COPY apps/api-gateway apps/api-gateway

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "run", "start", "--workspace", "apps/api-gateway"]
