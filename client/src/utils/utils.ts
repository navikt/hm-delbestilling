export const isProd = () => window.appSettings.NAIS_CLUSTER_NAME === 'prod-gcp'
export const isDev = () => window.appSettings.NAIS_CLUSTER_NAME === 'dev-gcp'
