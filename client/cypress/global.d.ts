interface Window {
  msw: {
    worker: import('msw').SetupWorker
    rest: typeof import('msw').rest
  }
}
