import { StatusCodes } from 'http-status-codes'
import { delay, http, HttpResponse } from 'msw'

import delBestillingMock from '../../services/delbestilling-mock.json'
import dellisteMock from '../../services/delliste-mock.json'
import hjelpemiddelMockComet from '../../services/hjelpemiddel-mock-comet.json'
import hjelpemiddelGemino20 from '../../services/hjelpemiddel-mock-gemino20.json'
import hjelpemiddelMockPanthera from '../../services/hjelpemiddel-mock-panthera.json'
import hjelpemidlerMock from '../../services/hjelpemidler-mock.json'
import { API_PATH } from '../../services/rest'
import {
  DelbestillingFeil,
  DelbestillingRequest,
  DelbestillingResponse,
  DellisteResponse,
  OppslagFeil,
  OppslagRequest,
  OppslagResponse,
  Pilot,
  SisteBatteribestillingResponse,
  XKLagerResponse,
} from '../../types/HttpTypes'
import { DelbestillingSak, LagerstatusPåBestillingstidspunkt, Ordrestatus } from '../../types/Types'

let tidligereBestillinger = delBestillingMock as unknown as DelbestillingSak[]
let tidligereBestillingerKommune = delBestillingMock as unknown as DelbestillingSak[]

const apiHandlers = [
  http.post<{}, OppslagRequest, OppslagResponse>(`${API_PATH}/oppslag`, async ({ request }) => {
    const { hmsnr } = await request.json()

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

    if (hmsnr === '444444') {
      throw new HttpResponse('Too many requests', { status: StatusCodes.TOO_MANY_REQUESTS })
    }

    const hjelpemiddel =
      hmsnr === '177946'
        ? hjelpemiddelGemino20.hjelpemiddel // grunndata-eksempel
        : hmsnr === '167624'
          ? hjelpemiddelMockComet.hjelpemiddel
          : hjelpemiddelMockPanthera.hjelpemiddel

    return HttpResponse.json({
      hjelpemiddel: { ...hjelpemiddel, hmsnr },
      feil: undefined,
      piloter: [Pilot.BESTILLE_IKKE_FASTE_LAGERVARER],
    })
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
      if (delLinje.del.lagerstatus.minmax === false) {
        delLinje.lagerstatusPåBestillingstidspunkt = LagerstatusPåBestillingstidspunkt.IKKE_PÅ_LAGER
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
  http.get<{}, {}, {}>(`${API_PATH}/hjelpemiddel-titler`, async () => {
    await delay(250)
    return HttpResponse.json({
      titler: [
        'Aurora Standard',
        'Aurora Standard XXL',
        'Aurora Synkron',
        'Aurora Tilt',
        'Aurora Tilt XXL',
        'Azalea',
        'C500',
        'Catalyst 5',
        'Cirrus G5',
        'Cirrus G5 (2020)',
        'Comet',
        'Comet Alpine',
        'Comet Alpine Plus',
        'Comet Ultra',
        'Compact Attract',
        'Cross 5XL',
        'Cross 5XL (2020)',
        'Cross 6',
        'Cross 6 (2020)',
        'Cross 6 (ledsagerbrems)',
        'Cross 6 (ledsagerbrems) (2020)',
        'Eloflex',
        'Emineo',
        'Etac Cross 5 XL kort',
        'Etac Cross 5 XL lang',
        'Etac Cross 5 kort',
        'Etac Cross 5 lang',
        'Exigo 30',
        'Exigo 30 (ledsagerbrems)',
        'Extreme X8',
        'F3',
        'F5',
        'Hepro S19V',
        'K-series G3',
        'Küschall Compact SA',
        'M3',
        'M5',
        'MC 1124',
        'MC 1144',
        'Minicrosser 125T',
        'Minicrosser M',
        'Minicrosser X',
        'Molift Mover 180',
        'Molift Smart 150',
        'Netti 3',
        'Netti III',
        'Netti III (2020)',
        'Netti III 2016',
        'Netti III Comfort',
        'Netti III HD',
        'Netti III HD (2020)',
        'Netti III HD 2016',
        'Netti V',
        'Opus Hjertebrett',
        'Opus Sengebunn S',
        'Opus seng',
        'Opus seng kort',
        'Orion',
        'Orion Pro 4W',
        'Panthera',
        'Pleieseng Opus 85 c',
        'QS5 X',
        'Seng OPUS 120EW',
        'Seng OPUS 90EW',
        'Seng Opus',
        'Seng Opus 90EW HS',
        'Seng Opus K85EW',
        'Sengebunn Opus SDW',
        'ViaGo V24',
        'Viamobil V25',
        'X850',
        'X850S',
        'Xact',
        'e-fix e35/36',
        'e-fix e35/36 (2020)',
      ],
    })
  }),

  http.get<{}, {}, SisteBatteribestillingResponse>(`${API_PATH}/siste-batteribestilling/:hmsnr/:serienr`, async () => {
    await delay(250)
    return HttpResponse.json({ antallDagerSiden: 10 })
    // return new HttpResponse(undefined, { status: 204 })
  }),
]

export default apiHandlers
