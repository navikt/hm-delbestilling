import { delay, http, HttpResponse } from 'msw'
import { v4 as uuidv4 } from 'uuid'

import { TilgangsforespørselgrunnlagResponse, TilgangsforespørselRequest } from '../../types/HttpTypes'
import { InnsendtTilgangsforespørsel, Tilgangsforespørselstatus } from '../../types/Types'

let innsendteTilgangsforespørsler: InnsendtTilgangsforespørsel[] = []

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
      const { forespørsler } = await request.json()

      forespørsler.forEach((forespørsel) => {
        innsendteTilgangsforespørsler.push({
          ...forespørsel,
          id: uuidv4(),
          status: !!forespørsel.påVegneAvKommune
            ? Tilgangsforespørselstatus.AVSLÅTT
            : Tilgangsforespørselstatus.AVVENTER_BEHANDLING,
        })
      })

      return HttpResponse.text('Created', { status: 201 })
    }
  ),

  http.get<{ rettighet: string }, {}, InnsendtTilgangsforespørsel[]>(
    '/hjelpemidler/delbestilling/roller/tilgang/foresporsel',
    async ({ request }) => {
      const url = new URL(request.url)
      const rettighet = url.searchParams.get('rettighet')

      await delay(500)
      return HttpResponse.json(innsendteTilgangsforespørsler.filter((innsendt) => innsendt.rettighet === rettighet))
    }
  ),

  http.delete<{ id: string }, {}, {}>(
    '/hjelpemidler/delbestilling/roller/tilgang/foresporsel/:id',
    async ({ params }) => {
      const { id } = params

      await delay(500)

      innsendteTilgangsforespørsler = innsendteTilgangsforespørsler.filter((forespørsel) => forespørsel.id !== id)

      return HttpResponse.text('OK', { status: 200 })
    }
  ),
]

export default tilgangHandlers
