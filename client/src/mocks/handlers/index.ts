import amplitudeHandlers from './amplitude'
import dkifHandlers from './dkif'
import oppslagHandlers from './oppslag'

const handlers = [...amplitudeHandlers, ...dkifHandlers, ...oppslagHandlers]

export default handlers
