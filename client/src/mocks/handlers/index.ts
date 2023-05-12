import amplitudeHandlers from './amplitude'
import dkifHandlers from './dkif'
import apiHandlers from './api'
import authHandlers from './auth'
import rollerHandlers from './roller'

const handlers = [...amplitudeHandlers, ...dkifHandlers, ...apiHandlers, ...authHandlers, ...rollerHandlers]

export default handlers
