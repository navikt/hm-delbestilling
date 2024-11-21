import { delay, http, HttpResponse } from 'msw'
import { v4 as uuidv4 } from 'uuid'

import { DelbestillerrolleResponse } from '../../types/HttpTypes'
import { Rettighet, Tilgangstatus } from '../../types/Types'

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
          harRettighet: false,
          tilganger: [
            {
              id: uuidv4(),
              navn: 'Max Mekker',
              representertKommune: { fylkenavn: 'Oslo', fylkenummer: '0', kommunenavn: 'Oslo', kommunenummer: '0301' },
              rettighet: Rettighet.DELBESTILLING,
              status: Tilgangstatus.AKTIV,
              behandlendeEnhet: {},
              arbeidsforhold: {
                kommune: {
                  kommunenavn: 'Oslo',
                  kommunenummer: '0301',
                  fylkenavn: 'Oslo',
                  fylkenummer: '01',
                },
                organisasjon: {
                  navn: 'Oslo kommune rehabilitering og mestring',
                  form: 'BEDR',
                  nummer: '0',
                },
                overordnetOrganisasjon: {
                  navn: 'Oslo kommune',
                  form: 'KOMM',
                  nummer: '0',
                },
                stillingstittel: 'Montør (tekniske hjelpemidler)',
              },
            },
          ],
        },
      },
    })
  }),
]

export default rollerHandlers
