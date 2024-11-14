import { delay, http, HttpResponse } from 'msw'

import { TilgangsforespørselgrunnlagResponse } from '../../types/HttpTypes'

const tilgangHandlers = [
  http.get<{}, {}, TilgangsforespørselgrunnlagResponse>(
    '/hjelpemidler/delbestilling/roller/tilgang/grunnlag',
    async () => {
      await delay(500)
      return HttpResponse.json({
        navn: 'Max Mekker',
        arbeidsforhold: [
          {
            kommunenavn: 'Oslo',
            kommunenummer: '0301',
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
          {
            kommunenavn: 'Oslo',
            kommunenummer: '0301',
            organisasjon: {
              navn: 'Privat Teknikerselskap AS',
              form: 'BEDR',
              nummer: '0',
            },
            overordnetOrganisasjon: {
              navn: 'Privat Teknikerselskap AS',
              form: 'BEDR',
              nummer: '0',
            },
            stillingstittel: 'Montør (tekniske hjelpemidler)',
          },
        ],
      })
    }
  ),
]

export default tilgangHandlers
