FROM node:22-alpine AS builder
WORKDIR /app
COPY client/package*.json client/
RUN npm ci --prefix client
COPY client/ client/
RUN npm run build --prefix client

FROM node:22-alpine
WORKDIR /app
COPY server/package*.json server/
RUN npm ci --prefix server --omit=dev
COPY server/ server/
COPY --from=builder /app/client/dist /app/client/dist

EXPOSE 5000
VOLUME ["/app/server/uploads"]
CMD ["node", "server/index.js"]
