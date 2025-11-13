import apiHandlers from './api'
import authHandlers from './auth'
import dkifHandlers from './dkif'
import rollerHandlers from './roller'
import umamiHandlers from './umami'

const handlers = [...dkifHandlers, ...apiHandlers, ...authHandlers, ...rollerHandlers, ...umamiHandlers]

export default handlers
