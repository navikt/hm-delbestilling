FROM node:18-alpine as client-builder
WORKDIR /app
COPY client/package.json client/package-lock.json .npmrc ./
RUN npm ci
COPY client .
# Upgrade grep to support the --include option, required for i18n tests
RUN apk add --no-cache --upgrade grep
RUN npm run build

FROM node:18-alpine as server-builder
WORKDIR /app
COPY server/package.json server/package-lock.json .npmrc ./
RUN npm ci
COPY server .
RUN npm run build

FROM node:18-alpine as server-dependencies
WORKDIR /app
COPY server/package.json server/package-lock.json .npmrc ./
RUN npm ci

FROM gcr.io/distroless/nodejs:18 as runtime
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 5000
COPY --from=client-builder /app/dist ./client/dist
COPY --from=server-builder /app/dist ./server/dist
WORKDIR /app/server
COPY --from=server-dependencies /app/node_modules ./node_modules
CMD [ "-r", "source-map-support/register", "-r", "dotenv/config", "dist/server.js" ]
