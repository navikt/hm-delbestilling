import amplitudeHandlers from './amplitude'
import apiHandlers from './api'
import authHandlers from './auth'
import dkifHandlers from './dkif'
import rollerHandlers from './roller'

const handlers = [...amplitudeHandlers, ...dkifHandlers, ...apiHandlers, ...authHandlers, ...rollerHandlers]

export default handlers
