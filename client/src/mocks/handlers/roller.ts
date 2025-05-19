import { delay, http, HttpResponse } from 'msw'

import { DelbestillerrolleResponse } from '../../types/HttpTypes'

const rollerHandlers = [
  http.get<{}, {}, DelbestillerrolleResponse>('/hjelpemidler/delbestilling/roller/delbestiller', async () => {
    await delay(250)
    return HttpResponse.json({
      delbestillerrolle: {
        kanBestilleDeler: true,
        erKommunaltAnsatt: true,
        kommunaleOrgs: [
          {
            orgnr: '0001',
            navn: 'Oslo Teknikere',
            orgform: 'KOMM',
            overordnetOrgnr: null,
            næringskoder: [],
            kommunenummer: '0301',
          },
        ],
        kommunaleAnsettelsesforhold: [
          {
            orgnr: '0001',
            navn: 'Oslo Teknikere',
            orgform: 'KOMM',
            overordnetOrgnr: null,
            næringskoder: [],
            kommunenummer: '0301',
          },
        ],
        representasjoner: [
          {
            orgnr: '0001',
            navn: 'Oslo Teknikere',
            orgform: 'KOMM',
            overordnetOrgnr: null,
            næringskoder: [],
            kommunenummer: '0301',
          },
        ],
        erBrukerpassbruker: false,
        erTekniker: true,
        privateAnsettelsesforhold: [],
        godkjenteIkkeKommunaleOrgs: [],
        erAnsattIGodkjentIkkeKommunaleOrgs: false,
      },
    })
  }),
]

export default rollerHandlers
