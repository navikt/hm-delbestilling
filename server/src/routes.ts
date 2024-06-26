import { fetchDecoratorHtml } from '@navikt/nav-dekoratoren-moduler/ssr'
import express, { Express, RequestHandler, Router } from 'express'
import { authMiddleware } from './auth'
import { config } from './config'
import { logger } from './logger'
import { clientLoggingHandler } from './logging'
import { reverseProxy } from './reverseProxy'
import { setupMetrics } from './setupMetrics'

export const routes = {
  log(): Router {
    const router = Router()
    router.post('/warning/:errorCode', clientLoggingHandler)
    return router
  },
  internal(): Router {
    const router = Router()
    router.get(['/isAlive', '/isReady'], (req, res) => {
      res.send('OK')
    })
    const prometheus = setupMetrics()
    router.get('/metrics', async (req, res) => {
      res.set('Content-Type', prometheus.contentType)
      res.end(await prometheus.metrics())
    })
    return router
  },
  api(): Router {
    reverseProxy.setup()
    const router = Router()
    router.use(reverseProxy.handlers.api())
    return router
  },
  roller(): Router {
    reverseProxy.setup()
    const router = Router()
    router.use(reverseProxy.handlers.roller())
    return router
  },
  public(server: Express): Router {
    const router = Router()
    router.get('/settings.js', settingsHandler)
    router.get('*', express.static(config.buildPath(), { index: false }))
    server.get('/utsjekk', authMiddleware.requiresLogin(), spaHandler)
    router.get('/utsjekk', authMiddleware.requiresLogin(), spaHandler)
    server.get('/kvittering', authMiddleware.requiresLogin(), spaHandler)
    router.get('/kvittering', authMiddleware.requiresLogin(), spaHandler)

    server.get('/', spaHandler)
    router.get('/', spaHandler)
    server.get('/oversikt', spaHandler)
    router.get('/oversikt', spaHandler)
    server.get('/delliste', spaHandler)
    router.get('/delliste', spaHandler)
    server.get('/bestillinger', authMiddleware.requiresLogin(), spaHandler)
    router.get('/bestillinger', authMiddleware.requiresLogin(), spaHandler)

    return router
  },
  auth(): Router {
    const router = Router()
    router.get('/login', authMiddleware.login())
    router.get('/logout', authMiddleware.logout())
    router.get('/auth/status', authMiddleware.requiresValidToken(), (req, res) => res.sendStatus(200))

    return router
  },
}

const spaHandler: RequestHandler = async (req, res) => {
  try {
    const decorator = await fetchDecoratorHtml({
      env: config.isProdCluster() ? 'prod' : 'dev',
      params: {
        context: 'samarbeidspartner',
        logoutWarning: true,
      },
    })
    res.render('index.html', decorator)
  } catch (err: unknown) {
    const error = `Failed to get decorator: ${err}`
    logger.error(error)
    res.status(500).send(error)
  }
}

const settingsHandler: RequestHandler = (req, res) => {
  const appSettings = {
    GIT_COMMIT: process.env.GIT_COMMIT,
    MILJO: process.env.NAIS_CLUSTER_NAME,
    USE_MSW: process.env.USE_MSW === 'true',
  }
  res.type('.js')
  res.send(`window.appSettings = ${JSON.stringify(appSettings)}`)
}
