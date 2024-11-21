import amplitudeHandlers from './amplitude'
import apiHandlers from './api'
import authHandlers from './auth'
import dkifHandlers from './dkif'
import oppslagHandlers from './oppslag'
import rollerHandlers from './roller'
import tilgangHandlers from './tilgang'

const handlers = [
  ...amplitudeHandlers,
  ...dkifHandlers,
  ...apiHandlers,
  ...authHandlers,
  ...rollerHandlers,
  ...tilgangHandlers,
  ...oppslagHandlers,
]

export default handlers
