#!/usr/bin/env sh

export BIND_ADDRESS=:9000

# hm-mocks
export NAIS_TOKEN_ENDPOINT=http://localhost:4040/texas/api/v1/token
export NAIS_TOKEN_EXCHANGE_ENDPOINT=http://localhost:4040/texas/api/v1/token/exchange
export NAIS_TOKEN_INTROSPECTION_ENDPOINT=http://localhost:4040/texas/api/v1/introspect

export NAIS_CLUSTER_NAME=local

export API_URL=http://localhost:4040
export ROLLER_URL=http://localhost:4040

export USE_MSW=true

go run .