import { StatusCodes } from 'http-status-codes'
import { rest } from 'msw'

import delBestillingMock from '../../services/delbestilling-mock.json'
import hjelpemiddelMockPanthera from '../../services/hjelpemiddel-mock-panthera.json'
import hjelpemidlerMock from '../../services/hjelpemidler-mock.json'
import { API_PATH } from '../../services/rest'
import {
  AlleHjelpemidlerMedDelerResponse,
  DelbestillingFeil,
  DelbestillingRequest,
  DelbestillingResponse,
  OppslagFeil,
  OppslagRequest,
  OppslagResponse,
} from '../../types/HttpTypes'
import { DelbestillingSak, Hjelpemiddel, Ordrestatus } from '../../types/Types'

let tidligereBestillinger = delBestillingMock as unknown as DelbestillingSak[]
let tidligereBestillingerKommune = delBestillingMock as unknown as DelbestillingSak[]

const apiHandlers = [
  rest.post<OppslagRequest, {}, OppslagResponse>(`${API_PATH}/oppslag`, (req, res, ctx) => {
    // req.body er egentlig deprecated, men det er problemer med å inferre typen fra generic
    // https://github.com/mswjs/msw/discussions/1308#discussioncomment-3389160
    const { hmsnr } = req.body

    if (hmsnr === '333333') {
      return res(
        ctx.delay(250),
        ctx.status(StatusCodes.NOT_FOUND),
        ctx.json({ hjelpemiddel: undefined, feil: OppslagFeil.INGET_UTLÅN })
      )
    }

    if (hmsnr === '000000') {
      return res(
        ctx.delay(250),
        ctx.status(StatusCodes.NOT_FOUND),
        ctx.json({ hjelpemiddel: undefined, feil: OppslagFeil.TILBYR_IKKE_HJELPEMIDDEL })
      )
    }

    if (hmsnr === '444444') {
      return res(ctx.delay(450), ctx.status(StatusCodes.TOO_MANY_REQUESTS))
    }

    let hjelpemiddel: Hjelpemiddel | undefined = hjelpemidlerMock.hjelpemidlerMedDeler.find((hm) => hm.hmsnr === hmsnr)

    if (!hjelpemiddel) {
      // Default til Panthera
      hjelpemiddel = hjelpemiddelMockPanthera.hjelpemiddel
    }

    return res(ctx.delay(250), ctx.json({ hjelpemiddel: { ...hjelpemiddel, hmsnr }, feil: undefined }))
  }),

  rest.post<DelbestillingRequest, {}, DelbestillingResponse>(`${API_PATH}/delbestilling`, async (req, res, ctx) => {
    const { delbestilling } = req.body

    if (
      !delbestilling ||
      !delbestilling.deler ||
      !delbestilling.hmsnr ||
      !delbestilling.serienr ||
      !delbestilling.levering
    ) {
      return res(ctx.status(StatusCodes.BAD_REQUEST))
    }

    const id = delbestilling.id

    if (delbestilling.serienr === '000000') {
      return res(
        ctx.delay(450),
        ctx.status(StatusCodes.NOT_FOUND),
        ctx.json({ id, feil: DelbestillingFeil.BRUKER_IKKE_FUNNET, saksnummer: null, delbestillingSak: null })
      )
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '111111') {
      return res(
        ctx.delay(450),
        ctx.status(StatusCodes.FORBIDDEN),
        ctx.json({ id, feil: DelbestillingFeil.BESTILLE_TIL_SEG_SELV, saksnummer: null, delbestillingSak: null })
      )
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '444444') {
      return res(
        ctx.delay(450),
        ctx.status(StatusCodes.FORBIDDEN),
        ctx.json({
          id,
          feil: DelbestillingFeil.ULIK_GEOGRAFISK_TILKNYTNING,
          saksnummer: null,
          delbestillingSak: null,
        })
      )
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '555555') {
      return res(
        ctx.delay(450),
        ctx.status(StatusCodes.NOT_FOUND),
        ctx.json({ id, feil: DelbestillingFeil.KAN_IKKE_BESTILLE, saksnummer: null, delbestillingSak: null })
      )
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '666666') {
      return res(
        ctx.delay(450),
        ctx.status(StatusCodes.FORBIDDEN),
        ctx.json({
          id,
          feil: DelbestillingFeil.FOR_MANGE_BESTILLINGER_SISTE_24_TIMER,
          saksnummer: null,
          delbestillingSak: null,
        })
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

    return res(
      ctx.delay(450),
      ctx.status(StatusCodes.CREATED),
      ctx.json({
        id,
        feil: null,
        saksnummer: nyDelbestilling.saksnummer,
        delbestillingSak: nyDelbestilling,
      })
    )
  }),

  rest.get<{}, {}, DelbestillingSak[]>(`${API_PATH}/delbestilling`, (req, res, ctx) => {
    return res(ctx.delay(250), ctx.json(tidligereBestillinger))
  }),

  rest.get<{}, {}, DelbestillingSak[]>(`${API_PATH}/delbestilling/kommune`, (req, res, ctx) => {
    return res(ctx.delay(250), ctx.json(tidligereBestillingerKommune))
  }),
  rest.get<{}, {}, AlleHjelpemidlerMedDelerResponse>(`${API_PATH}/hjelpemidler`, (req, res, ctx) => {
    return res(ctx.delay(250), ctx.json(hjelpemidlerMock))
  }),
]

export default apiHandlers
