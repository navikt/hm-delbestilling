import { auth } from './auth'
import proxy, { ProxyOptions } from 'express-http-proxy'
import { config } from './config'
import type { Request, RequestHandler } from 'express'

function options(targetAudience: string): ProxyOptions {
  return {
    parseReqBody: false,
    async proxyReqOptDecorator(options, req) {
      if (!config.isMocked()) {
        const idportenToken = req.headers['authorization']?.split(' ')[1]
        if (auth.tokenIsValid(idportenToken)) {
          const { access_token } = await auth.exchangeToken(idportenToken, targetAudience)
          if (options.headers) {
            options.headers.Authorization = `Bearer ${access_token}`
          }
        }
      }
      return options
    },
    proxyReqPathResolver(req) {
      return pathRewriteBasedOnEnvironment(req)
    },
  }
}

const envProperties = {
  API_URL: process.env.API_URL || 'http://localhost:9090',
  HJELPEMIDDELDATABASEN_URL: process.env.HJELPEMIDDELDATABASEN_URL || 'https://hm-grunndata-api.dev.intern.nav.no',
  ROLLER_URL: process.env.ROLLER_URL || 'http://localhost:8091',
}

function pathRewriteBasedOnEnvironment(req: Request): string {
  return req.originalUrl
    .replace('/hjelpemidler/delbestilling/api', '/api')
    .replace('/hjelpemidler/delbestilling/hjelpemiddeldatabasen', '/graphql')
}

function setup() {
  auth.setup(config.idporten, config.tokenx, config.app).catch((err: unknown) => {
    console.log(`Error while setting up auth: ${err}`)
    process.exit(1)
  })
}

const handlers = {
  api: (): RequestHandler => proxy(envProperties.API_URL, options(config.app.targetAudienceAPI)),
  hjelpemiddeldatabasen: (): RequestHandler =>
    proxy(envProperties.HJELPEMIDDELDATABASEN_URL, {
      parseReqBody: false,
      proxyReqPathResolver(req) {
        return pathRewriteBasedOnEnvironment(req)
      },
    }),
  roller: (): RequestHandler => proxy(envProperties.ROLLER_URL, options(config.app.targetAudienceRoller)),
}

export const reverseProxy = {
  setup,
  handlers,
}
