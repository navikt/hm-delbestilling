import { StatusCodes } from 'http-status-codes'
import { delay, http, HttpResponse } from 'msw'

import delBestillingMock from '../../services/delbestilling-mock.json'
import dellisteMock from '../../services/delliste-mock.json'
import { DELBESTILLING_API_PATH, DELBESTILLING_PUBLIC_API_PATH } from '../../services/rest'
import {
  DelbestillingFeil,
  DelbestillingRequest,
  DelbestillingResponse,
  DellisteResponse,
  OppslagFeil,
  OppslagRequest,
  OppslagRequestUtenSerienr,
  OppslagResponse,
  OppslagResponseUtenDeler,
  TilgjengeligeHjelpemidlerResponse,
  XKLagerResponse,
} from '../../types/HttpTypes'
import { DelbestillingSak, Ordrestatus } from '../../types/Types'

let tidligereBestillinger = delBestillingMock as unknown as DelbestillingSak[]
let tidligereBestillingerKommune = delBestillingMock as unknown as DelbestillingSak[]

const apiHandlers = [
  http.post<{hmsnr: string}, OppslagRequest, OppslagResponse>(`${DELBESTILLING_API_PATH}/hjelpemidler/:hmsnr/deler`, async ({ request, params }) => {
    const { serienr, brukernr } = await request.json()
    const hmsnr = params['hmsnr']

    await delay(250)

    if (hmsnr === '333333') {
      return HttpResponse.json(
        { hjelpemiddel: undefined, feil: OppslagFeil.INGET_UTLÅN, piloter: [] },
        { status: StatusCodes.NOT_FOUND }
      )
    }

    if (hmsnr === '000000') {
      return HttpResponse.json(
        { hjelpemiddel: undefined, feil: OppslagFeil.TILBYR_IKKE_HJELPEMIDDEL, piloter: [] },
        { status: StatusCodes.NOT_FOUND }
      )
    }

    if (hmsnr === '666666') {
      return HttpResponse.json(
        { hjelpemiddel: undefined, feil: OppslagFeil.PERSON_IKKE_FUNNET, piloter: [] },
        { status: StatusCodes.NOT_FOUND }
      )
    }

    if (hmsnr === '444444') {
      throw new HttpResponse('Too many requests', { status: StatusCodes.TOO_MANY_REQUESTS })
    }

    const response = await fetch(`${DELBESTILLING_API_PATH}/oppslag-ekstern-dev-deler`, {
      method: 'POST',
      body: JSON.stringify({ hmsnr, serienr, brukernr}),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return HttpResponse.json(await response.json())
  }),
  http.get<{hmsnr: string}, {}, OppslagResponseUtenDeler>(`${DELBESTILLING_PUBLIC_API_PATH}/hjelpemidler/:hmsnr`, async ({ params }) => {
    const hmsnr = params['hmsnr']

    await delay(250)

    if (hmsnr === '333333') {
      return HttpResponse.json(
        { hjelpemiddel: undefined, feil: OppslagFeil.INGET_UTLÅN,},
        { status: StatusCodes.NOT_FOUND }
      )
    }

    if (hmsnr === '000000') {
      return HttpResponse.json(
        { hjelpemiddel: undefined, feil: OppslagFeil.TILBYR_IKKE_HJELPEMIDDEL},
        { status: StatusCodes.NOT_FOUND }
      )
    }

    if (hmsnr === '666666') {
      return HttpResponse.json(
        { hjelpemiddel: undefined, feil: OppslagFeil.PERSON_IKKE_FUNNET},
        { status: StatusCodes.NOT_FOUND }
      )
    }

    if (hmsnr === '444444') {
      throw new HttpResponse('Too many requests', { status: StatusCodes.TOO_MANY_REQUESTS })
    }

    const response = await fetch(`${DELBESTILLING_API_PATH}/oppslag-ekstern-dev-hjelpemiddel`, {
      method: 'POST',
      body: JSON.stringify({ hmsnr}),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return HttpResponse.json(await response.json())
  }),

  http.post<{}, DelbestillingRequest, DelbestillingResponse>(`${DELBESTILLING_API_PATH}/delbestilling`, async ({ request }) => {
    const { delbestilling } = await request.json()

    await delay(450)

    if (
      !delbestilling ||
      !delbestilling.deler ||
      !delbestilling.hmsnr ||
      (!delbestilling.serienr && !delbestilling.brukernr) ||
      !delbestilling.levering
    ) {
      throw new HttpResponse('Bad Request', { status: StatusCodes.BAD_REQUEST })
    }

    const id = delbestilling.id

    if (delbestilling.serienr === '000000') {
      return HttpResponse.json(
        {
          id,
          feil: DelbestillingFeil.BRUKER_IKKE_FUNNET,
          saksnummer: null,
          delbestillingSak: null,
        },
        { status: StatusCodes.NOT_FOUND }
      )
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '111111') {
      return HttpResponse.json(
        {
          id,
          feil: DelbestillingFeil.BESTILLE_TIL_SEG_SELV,
          saksnummer: null,
          delbestillingSak: null,
        },
        { status: StatusCodes.FORBIDDEN }
      )
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '444444') {
      return HttpResponse.json(
        {
          id,
          feil: DelbestillingFeil.ULIK_GEOGRAFISK_TILKNYTNING,
          saksnummer: null,
          delbestillingSak: null,
        },
        { status: StatusCodes.FORBIDDEN }
      )
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '555555') {
      return HttpResponse.json(
        {
          id,
          feil: DelbestillingFeil.KAN_IKKE_BESTILLE,
          saksnummer: null,
          delbestillingSak: null,
        },
        { status: StatusCodes.NOT_FOUND }
      )
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '666666') {
      return HttpResponse.json(
        {
          id,
          feil: DelbestillingFeil.FOR_MANGE_BESTILLINGER_SISTE_24_TIMER,
          saksnummer: null,
          delbestillingSak: null,
        },
        { status: StatusCodes.FORBIDDEN }
      )
    }

    const nyDelbestilling = {
      saksnummer: tidligereBestillinger.length + 1,
      delbestilling,
      opprettet: new Date().toISOString(),
      sistOppdatert: new Date().toISOString(),
      status: Ordrestatus.INNSENDT,
      oebsOrdrenummer: null,
    }

    // for mocking: anta at alle deler som ikke er minmax heller ikke er tilgjengelige på lager
    nyDelbestilling.delbestilling.deler = nyDelbestilling.delbestilling.deler.map((delLinje) => {
      delLinje.lagerstatusPåBestillingstidspunkt = {
        artikkelnummer: delLinje.del.hmsnr,
        minmax: delLinje.del.lagerstatus.minmax,
        antallDelerPåLager: delLinje.del.lagerstatus.minmax === false ? 0 : 10,
        organisasjons_id: 263,
        organisasjons_navn: '*05 Oppland',
        tilgjengelig: delLinje.del.lagerstatus.minmax === false ? 0 : 10,
      }

      return delLinje
    })

    tidligereBestillinger.push(nyDelbestilling)

    return HttpResponse.json(
      {
        id,
        feil: null,
        saksnummer: nyDelbestilling.saksnummer,
        delbestillingSak: nyDelbestilling,
      },
      { status: StatusCodes.CREATED }
    )
  }),

  http.post<{}, {}, XKLagerResponse>(`${DELBESTILLING_API_PATH}/xk-lager`, async () => {
    await delay(250)
    return HttpResponse.json({ xkLager: true })
  }),

  http.get<{}, {}, DelbestillingSak[]>(`${DELBESTILLING_API_PATH}/delbestilling`, async () => {
    await delay(250)
    return HttpResponse.json(tidligereBestillinger)
  }),

  http.get<{}, {}, DelbestillingSak[]>(`${DELBESTILLING_API_PATH}/delbestilling/kommune`, async () => {
    await delay(250)
    return HttpResponse.json(tidligereBestillingerKommune)
  }),
  http.get<{}, {}, DellisteResponse>(`${DELBESTILLING_API_PATH}/deler`, async () => {
    await delay(250)
    return HttpResponse.json(dellisteMock)
  }),

  http.get<{}, {}, TilgjengeligeHjelpemidlerResponse>(`${DELBESTILLING_PUBLIC_API_PATH}/tilgjengelige-hjelpemidler`, async () => {
    await delay(250)
    return HttpResponse.json({
      'Aurora Standard': ['296142', '296146', '296143', '296147', '296140', '296141', '296144', '296145'],
      'Aurora Standard XXL': ['296148', '296149'],
      'Aurora Synkron': ['296151', '296152', '296156', '296153', '296157', '296150', '296154', '296155'],
    })
  }),

  http.post<{}, { hmsnrs: string[] }, string[]>(`${DELBESTILLING_PUBLIC_API_PATH}/deler-til-hmsnrs`, async () => {
    await delay(250)
    return HttpResponse.json(['Del 1', 'Del 2', 'Del 3'])
  }),
]

export default apiHandlers
