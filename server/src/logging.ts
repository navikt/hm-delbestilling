import type { RequestHandler } from 'express'
import { jsonLogger } from './logger'

const errorMessages = new Map()
errorMessages.set('hmsdb-fallback', 'Feil ved henting av produktdata. Bruker fallback.')

export const clientLoggingHandler: RequestHandler = (req, res) => {
  const errorCode = req.params.errorCode
  if (errorMessages.has(errorCode)) {
    jsonLogger.warn(errorMessages.get(errorCode))
  }
}
