import { delay, http, HttpResponse } from 'msw'

import { Kommuner } from '../../services/rest'
import kommuner from './data/kommuner.json'

const oppslagHandlers = [
  http.get<{}, {}, Kommuner>('/hjelpemidler/delbestilling/oppslag/geografi/kommuner', async () => {
    await delay(1000)
    return HttpResponse.json(kommuner)
  }),
]

export default oppslagHandlers
