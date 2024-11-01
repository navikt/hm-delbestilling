import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'

import handlers from './handlers/index'

// for browser environments
export const worker = setupWorker(...handlers)

let started = false

// Make it accessible for cypress
window.msw = {
  worker,
  http,
  HttpResponse,
  started,
}
