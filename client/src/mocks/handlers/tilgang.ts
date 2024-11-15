import { delay, http, HttpResponse } from 'msw'

import { TilgangsforespørselgrunnlagResponse, TilgangsforespørselRequest } from '../../types/HttpTypes'
import { InnsendtTilgangsforespørsel, Tilgangsforespørselstatus } from '../../types/Types'

const innsendteTilgangsforespørsler: InnsendtTilgangsforespørsel[] = []

const tilgangHandlers = [
  http.get<{}, {}, TilgangsforespørselgrunnlagResponse>(
    '/hjelpemidler/delbestilling/roller/tilgang/grunnlag',
    async () => {
      await delay(500)
      return HttpResponse.json({
        grunnlag: {
          navn: 'Max Mekker',
          arbeidsforhold: [
            {
              kommune: {
                kommunenavn: 'Oslo',
                kommunenummer: '0301',
                fylkenavn: 'Oslo',
                fylkenummer: '01',
                fylkesnavn: 'Oslo',
                fylkesnummer: '01',
              },
              organisasjon: {
                navn: 'Oslo kommune rehabilitering og mestring',
                orgform: 'BEDR',
                orgnr: '0',
                overordnetOrgnr: '0',
                næringskoder: [],
                kommunenummer: '0301',
              },
              overordnetOrganisasjon: {
                navn: 'Oslo kommune',
                orgform: 'KOMM',
                orgnr: '0',
                overordnetOrgnr: undefined,
                næringskoder: [],
                kommunenummer: '0301',
              },
              stillingstittel: 'Montør (tekniske hjelpemidler)',
            },
            {
              kommune: {
                kommunenavn: 'Oslo',
                kommunenummer: '0301',
                fylkenavn: 'Oslo',
                fylkenummer: '01',
                fylkesnavn: 'Oslo',
                fylkesnummer: '01',
              },
              organisasjon: {
                navn: 'Privat Teknikerselskap AS',
                orgform: 'BEDR',
                orgnr: '0',
                næringskoder: [],
                overordnetOrgnr: '0',
                kommunenummer: '0301',
              },
              overordnetOrganisasjon: {
                navn: 'Privat Teknikerselskap AS',
                orgform: 'BEDR',
                orgnr: '0',
                næringskoder: [],
                overordnetOrgnr: undefined,
                kommunenummer: '0301',
              },
              stillingstittel: 'Montør (tekniske hjelpemidler)',
            },
          ],
        },
      })
    }
  ),

  http.post<{}, TilgangsforespørselRequest, any>(
    '/hjelpemidler/delbestilling/roller/tilgang/foresporsel',
    async ({ request }) => {
      await delay(1000)
      const { forespørsel } = await request.json()
      innsendteTilgangsforespørsler.push({
        ...forespørsel,
        status: !!forespørsel.påVegneAvKommune
          ? Tilgangsforespørselstatus.AVSLÅTT
          : Tilgangsforespørselstatus.AVVENTER_BEHANDLING,
      })
      return new HttpResponse('Created', { status: 201 })
    }
  ),

  http.get<{ rettighet: string }, {}, {}>(
    '/hjelpemidler/delbestilling/roller/tilgang/innsendteforesporsler',
    async ({ request }) => {
      const url = new URL(request.url)
      const rettighet = url.searchParams.get('rettighet')

      await delay(500)
      return HttpResponse.json(innsendteTilgangsforespørsler.filter((innsendt) => innsendt.rettighet === rettighet))
    }
  ),
]

export default tilgangHandlers
