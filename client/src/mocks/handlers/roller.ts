import { delay, http, HttpResponse } from 'msw'

import { DelbestillerrolleResponse } from '../../types/HttpTypes'

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
      },
    })
  }),
]

export default rollerHandlers
