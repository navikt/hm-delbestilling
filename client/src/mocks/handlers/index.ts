import amplitudeHandlers from './amplitude'
import dkifHandlers from './dkif'
import oppslagHandlers from './oppslag'
import authHandlers from './auth'

const handlers = [...amplitudeHandlers, ...dkifHandlers, ...oppslagHandlers, ...authHandlers]

export default handlers
