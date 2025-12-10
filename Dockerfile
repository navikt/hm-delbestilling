FROM node:lts-alpine AS client-builder
WORKDIR /app

# Enable pnpm (see package.json for version)
RUN corepack enable

COPY client/package.json client/pnpm-lock.yaml .npmrc ./
RUN pnpm fetch
COPY client .
RUN pnpm install --offline
RUN apk add --no-cache --upgrade grep
RUN pnpm run build

FROM golang:1.25.1-alpine AS server-builder
WORKDIR /app
COPY server ./
RUN go build .

FROM gcr.io/distroless/static-debian12 AS runtime
WORKDIR /app

ENV TZ="Europe/Oslo"
EXPOSE 5000

COPY --from=client-builder /app/dist ./dist
COPY --from=server-builder /app/hm-delbestilling .

CMD [ "./hm-delbestilling" ]