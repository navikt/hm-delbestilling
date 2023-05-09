interface Window {
  msw: {
    worker: import('msw').SetupWorkerApi
    rest: typeof import('msw').rest
  }
}
