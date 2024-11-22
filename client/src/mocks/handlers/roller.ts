import { delay, http, HttpResponse } from 'msw'
import { v4 as uuidv4 } from 'uuid'

import { DelbestillerrolleResponse } from '../../types/HttpTypes'
import { Rettighet } from '../../types/Types'

import { innsendteTilgangsforespørsler, tilganger } from './tilgang'

const rollerHandlers = [
  http.get<{}, {}, DelbestillerrolleResponse>('/hjelpemidler/delbestilling/roller/delbestiller', async () => {
    await delay(250)
    return HttpResponse.json({
      delbestillerrolle: {
        kanBestilleDeler: true,
        harXKLager: true,
        erKommunaltAnsatt: true,
        kommunaleOrgs: [
          {
            orgnr: '0001',
            navn: 'Oslo Teknikere',
            orgform: 'KOMM',
            overordnetOrgnr: undefined,
            næringskoder: [],
            kommunenummer: '0301',
          },
        ],
        delbestillerrettighet: {
          harRettighet: tilganger.some((t) => t.rettighet === Rettighet.DELBESTILLING),
          forespørsler: innsendteTilgangsforespørsler,
          tilganger: tilganger,
        },
      },
    })
  }),
]

export default rollerHandlers
