export const isProd = () => window.appSettings.MILJO === 'prod-gcp'
export const isDev = () => window.appSettings.MILJO === 'dev-gcp'
