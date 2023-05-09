import promClient, { Registry } from 'prom-client'

export function setupMetrics(): Registry {
  const collectDefaultMetrics = promClient.collectDefaultMetrics
  const Registry = promClient.Registry
  const register = new Registry()

  collectDefaultMetrics({ register })
  return register
}
