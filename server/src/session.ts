import session, { SessionOptions } from 'express-session'
import { config } from './config'
import memoryStore from 'memorystore'
import type { SetRequired } from 'type-fest'
import type { TokenSetParameters } from 'openid-client'
import type { RequestHandler } from 'express'

const MemoryStore = memoryStore(session)

declare module 'express-session' {
  interface SessionData {
    id: string
    state?: string
    nonce?: string
    tokens?: TokenSetParameters
    idportenSid?: string
  }
}

export function setupSession() {
  const options: SetRequired<SessionOptions, 'cookie'> = {
    cookie: {
      maxAge: config.session.maxAgeMs,
      sameSite: 'lax',
      httpOnly: true,
    },
    secret: config.session.secret,
    name: 'hjelpemidlerdigitalsoknad',
    resave: false,
    saveUninitialized: false,
    unset: 'destroy',
  }

  options.store = new MemoryStore({ checkPeriod: 86400000 })

  return {
    session(): RequestHandler {
      return session(options)
    },
  }
}
