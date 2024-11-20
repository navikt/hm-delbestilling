import { delay, http, HttpResponse } from 'msw'
import { v4 as uuidv4 } from 'uuid'

import { TilgangsforespørselgrunnlagResponse, TilgangsforespørselRequest } from '../../types/HttpTypes'
import {
  InnsendtTilgangsforespørsel,
  Rettighet,
  Tilgang,
  Tilgangsforespørselstatus,
  Tilgangstatus,
} from '../../types/Types'

let innsendteTilgangsforespørsler: InnsendtTilgangsforespørsel[] = []
let tilganger: Tilgang[] = []

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
        },
      })
    }
  ),

  http.get<{}, {}, Tilgang[]>('/hjelpemidler/delbestilling/roller/tilgang', async ({ request }) => {
    const url = new URL(request.url)
    const rettighet = url.searchParams.get('rettighet')

    await delay(500)
    return HttpResponse.json(tilganger)
  }),

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

  http.put<{}, { id: string; status: Tilgangsforespørselstatus }, {}>(
    '/hjelpemidler/delbestilling/roller/tilgang/foresporsel/status',
    async ({ request }) => {
      const { id, status } = await request.json()

      await delay(500)

      innsendteTilgangsforespørsler = innsendteTilgangsforespørsler.map((f) => (f.id === id ? { ...f, status } : f))

      if (status === Tilgangsforespørselstatus.GODKJENT) {
        const forespørsel = innsendteTilgangsforespørsler.find((f) => f.id === id)!
        tilganger.push({
          id,
          navn: forespørsel.navn,
          arbeidsforhold: forespørsel.arbeidsforhold,
          rettighet: forespørsel.rettighet,
          behandlendeEnhet: {},
          status: Tilgangstatus.AKTIV,
        })
      }

      return HttpResponse.text('OK', { status: 200 })
    }
  ),
]

export default tilgangHandlers
