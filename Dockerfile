FROM node:lts-alpine AS client-builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY client/package.json client/pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY client .
# Upgrade grep to support the --include option, required for i18n tests
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