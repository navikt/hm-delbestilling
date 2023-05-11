import amplitudeHandlers from './amplitude'
import dkifHandlers from './dkif'
import oppslagHandlers from './oppslag'
import authHandlers from './auth'
import rollerHandlers from './roller'

const handlers = [...amplitudeHandlers, ...dkifHandlers, ...oppslagHandlers, ...authHandlers, ...rollerHandlers]

export default handlers
