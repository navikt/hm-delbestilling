import amplitudeHandlers from './amplitude'
import dkifHandlers from './dkif'
import oppslagHandlers from './oppslag'
import sessionHandlers from './session'

const handlers = [...amplitudeHandlers, ...dkifHandlers, ...oppslagHandlers, ...sessionHandlers]

export default handlers
