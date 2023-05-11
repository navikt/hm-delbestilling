import { setupSession } from './session'
import { authMiddleware } from './auth'
import express from 'express'
import mustacheExpress from 'mustache-express'
import { config } from './config'
import { routes } from './routes'
import { helmetConfig } from './helmetConfig'

const server = express()
if (!config.isMocked()) {
  server.use(helmetConfig())
}
server.set('views', config.buildPath())
server.set('view engine', 'mustache')
server.engine('html', mustacheExpress())
server.set('trust proxy', 1)

const { session } = setupSession()
server.use(session())

const router = express.Router()
router.use('/internal/', routes.internal())
router.use('/api/', authMiddleware.requiresValidToken(), routes.api())
router.use('/session', authMiddleware.requiresValidToken(), routes.session())
router.use('/', routes.auth())
router.use('/', routes.public(server))

server.use(config.basePath, router)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
