import { rest, setupWorker } from 'msw'

import handlers from './handlers/index'

// for browser environments
export const worker = setupWorker(...handlers)

let started = false

// Make it accessible for cypress
window.msw = {
  worker,
  rest,
  started,
}
