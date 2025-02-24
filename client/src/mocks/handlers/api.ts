import { StatusCodes } from 'http-status-codes'
import { delay, http, HttpResponse } from 'msw'

import delBestillingMock from '../../services/delbestilling-mock.json'
import dellisteMock from '../../services/delliste-mock.json'
import hjelpemiddelMockComet from '../../services/hjelpemiddel-mock-comet.json'
import hjelpemiddelMockPanthera from '../../services/hjelpemiddel-mock-panthera.json'
import hjelpemidlerMock from '../../services/hjelpemidler-mock.json'
import { API_PATH } from '../../services/rest'
import {
  AlleHjelpemidlerMedDelerResponse,
  DelbestillingFeil,
  DelbestillingRequest,
  DelbestillingResponse,
  DellisteResponse,
  OppslagFeil,
  OppslagRequest,
  OppslagResponse,
  XKLagerResponse,
} from '../../types/HttpTypes'
import { DelbestillingSak, Ordrestatus } from '../../types/Types'

let tidligereBestillinger = delBestillingMock as unknown as DelbestillingSak[]
let tidligereBestillingerKommune = delBestillingMock as unknown as DelbestillingSak[]

const apiHandlers = [
  http.post<{}, OppslagRequest, OppslagResponse>(`${API_PATH}/oppslag`, async ({ request }) => {
    const { hmsnr } = await request.json()

    await delay(250)

    if (hmsnr === '333333') {
      return HttpResponse.json(
        { hjelpemiddel: undefined, feil: OppslagFeil.INGET_UTLÅN },
        { status: StatusCodes.NOT_FOUND }
      )
    }

    if (hmsnr === '000000') {
      return HttpResponse.json(
        { hjelpemiddel: undefined, feil: OppslagFeil.TILBYR_IKKE_HJELPEMIDDEL },
        { status: StatusCodes.NOT_FOUND }
      )
    }

    if (hmsnr === '444444') {
      throw new HttpResponse('Too many requests', { status: StatusCodes.TOO_MANY_REQUESTS })
    }

    const hjelpemiddel = hmsnr === '167624' ? hjelpemiddelMockComet.hjelpemiddel : hjelpemiddelMockPanthera.hjelpemiddel

    return HttpResponse.json({ hjelpemiddel: { ...hjelpemiddel, hmsnr }, feil: undefined })
  }),

  http.post<{}, DelbestillingRequest, DelbestillingResponse>(`${API_PATH}/delbestilling`, async ({ request }) => {
    const { delbestilling } = await request.json()

    await delay(450)

    if (
      !delbestilling ||
      !delbestilling.deler ||
      !delbestilling.hmsnr ||
      !delbestilling.serienr ||
      !delbestilling.levering
    ) {
      throw new HttpResponse('Bad Request', { status: StatusCodes.BAD_REQUEST })
    }

    const id = delbestilling.id

    if (delbestilling.serienr === '000000') {
      return HttpResponse.json(
        { id, feil: DelbestillingFeil.BRUKER_IKKE_FUNNET, saksnummer: null, delbestillingSak: null },
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

  http.post<{}, {}, XKLagerResponse>(`${API_PATH}/xk-lager`, async () => {
    await delay(250)
    return HttpResponse.json({ xkLager: true })
  }),

  http.get<{}, {}, DelbestillingSak[]>(`${API_PATH}/delbestilling`, async () => {
    await delay(250)
    return HttpResponse.json(tidligereBestillinger)
  }),

  http.get<{}, {}, DelbestillingSak[]>(`${API_PATH}/delbestilling/kommune`, async () => {
    await delay(250)
    return HttpResponse.json(tidligereBestillingerKommune)
  }),
  http.get<{}, {}, {}>(`${API_PATH}/hjelpemidler`, async () => {
    await delay(250)
    return HttpResponse.json(hjelpemidlerMock)
  }),
  http.get<{}, {}, DellisteResponse>(`${API_PATH}/deler`, async () => {
    await delay(250)
    return HttpResponse.json(dellisteMock)
  }),
]

export default apiHandlers
