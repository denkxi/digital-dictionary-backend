FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY --from=builder /app/dist ./dist

ENV PORT=3000
ENV MONGO_URI="mongodb://mongo:27017/mydb"

EXPOSE ${PORT}
CMD ["node", "dist/index.js"]
