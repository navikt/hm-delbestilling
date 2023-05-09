export async function initMSW(): Promise<ServiceWorkerRegistration | void> {
  if (!window.appSettings.USE_MSW) {
    return
  }
  const { worker } = await import('../mocks/browser')
  const startedWorker = worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/hjelpemidler/delbestilling/mockServiceWorker.js',
    },
  })
  window.msw.started = true
  return startedWorker
}
