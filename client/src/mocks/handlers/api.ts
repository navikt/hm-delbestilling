import { StatusCodes } from 'http-status-codes'
import { rest } from 'msw'

import delBestillingMock from '../../services/delbestilling-mock.json'
import hjelpemiddelMockComet from '../../services/hjelpemiddel-mock-comet.json'
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
import { DelbestillingSak, Status } from '../../types/Types'

let tidligereBestillinger = delBestillingMock.slice(0, 4) as unknown as DelbestillingSak[]
let tidligereBestillingerKommune = delBestillingMock.slice(4) as unknown as DelbestillingSak[]

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

    const hjelpemiddel = hmsnr === '167624' ? hjelpemiddelMockComet.hjelpemiddel : hjelpemiddelMockPanthera.hjelpemiddel

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

    tidligereBestillinger.push({
      saksnummer: tidligereBestillinger.length + 1,
      delbestilling,
      opprettet: new Date(),
      sistOppdatert: new Date(),
      status: Status.INNSENDT,
    })

    if (delbestilling.serienr === '000000') {
      return res(
        ctx.delay(450),
        ctx.status(StatusCodes.NOT_FOUND),
        ctx.json({ id, feil: DelbestillingFeil.BRUKER_IKKE_FUNNET })
      )
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '111111') {
      return res(
        ctx.delay(450),
        ctx.status(StatusCodes.FORBIDDEN),
        ctx.json({ id, feil: DelbestillingFeil.BESTILLE_TIL_SEG_SELV })
      )
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '444444') {
      return res(
        ctx.delay(450),
        ctx.status(StatusCodes.FORBIDDEN),
        ctx.json({ id, feil: DelbestillingFeil.ULIK_GEOGRAFISK_TILKNYTNING })
      )
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '555555') {
      return res(
        ctx.delay(450),
        ctx.status(StatusCodes.NOT_FOUND),
        ctx.json({ id, feil: DelbestillingFeil.KAN_IKKE_BESTILLE })
      )
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '666666') {
      return res(
        ctx.delay(450),
        ctx.status(StatusCodes.FORBIDDEN),
        ctx.json({ id, feil: DelbestillingFeil.FOR_MANGE_BESTILLINGER_SISTE_24_TIMER })
      )
    }

    return res(ctx.delay(450), ctx.status(StatusCodes.CREATED), ctx.json({ id: delbestilling.id }))
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
  rest.get<{}, {}, AlleHjelpemidlerMedDelerResponse>(`${API_PATH}/hjelpemidler`, (req, res, ctx) => {
    return res(ctx.delay(250), ctx.json(hjelpemidlerMock))
  }),
]

export default apiHandlers
