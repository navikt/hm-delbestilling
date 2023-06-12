import { rest } from 'msw'
import {
  OppslagFeil,
  OppslagRequest,
  OppslagResponse,
  DelbestillingResponse,
  DelbestillingRequest,
  DelbestillingFeil,
} from '../../types/HttpTypes'
import hjelpemiddelMock from '../../services/hjelpemiddel-mock.json'
import { Hjelpemiddel, Delbestilling } from '../../types/Types'

import { API_PATH } from '../../services/rest'

let tidligereBestillinger: Delbestilling[] = []

const apiHandlers = [
  rest.post<OppslagRequest, {}, OppslagResponse>(`${API_PATH}/oppslag`, (req, res, ctx) => {
    const { hmsnr } = req.body

    if (hmsnr === '333333') {
      return res(ctx.delay(250), ctx.status(404), ctx.json({ hjelpemiddel: undefined, feil: OppslagFeil.INGET_UTLÅN }))
    }

    const hjelpemiddel: Hjelpemiddel | undefined = hjelpemiddelMock.find((hm) => hm.hmsnr === hmsnr)

    if (!hjelpemiddel) {
      return res(
        ctx.delay(250),
        ctx.status(404),
        ctx.json({ hjelpemiddel: undefined, feil: OppslagFeil.TILBYR_IKKE_HJELPEMIDDEL })
      )
    }

    return res(ctx.delay(250), ctx.json({ hjelpemiddel, feil: undefined }))
  }),

  rest.post<DelbestillingRequest, {}, DelbestillingResponse>(`${API_PATH}/delbestilling`, (req, res, ctx) => {
    const { delbestilling } = req.body

    if (
      !delbestilling ||
      !delbestilling.deler ||
      !delbestilling.hmsnr ||
      !delbestilling.serienr ||
      !delbestilling.levering
    ) {
      return res(ctx.status(400))
    }

    const id = delbestilling.id

    tidligereBestillinger.push(delbestilling)

    if (delbestilling.serienr === '000000') {
      return res(ctx.delay(450), ctx.status(404), ctx.json({ id, feil: DelbestillingFeil.BRUKER_IKKE_FUNNET }))
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '111111') {
      return res(ctx.delay(450), ctx.status(403), ctx.json({ id, feil: DelbestillingFeil.BESTILLE_TIL_SEG_SELV }))
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '333333') {
      return res(ctx.delay(450), ctx.status(403), ctx.json({ id, feil: DelbestillingFeil.ULIK_GEOGRAFISK_TILKNYTNING }))
    }

    if (delbestilling.hmsnr === '222222' && delbestilling.serienr === '444444') {
      return res(ctx.delay(450), ctx.status(404), ctx.json({ id, feil: DelbestillingFeil.KAN_IKKE_BESTILLE }))
    }

    // return res(ctx.delay(450), ctx.status(400))
    // return res(ctx.delay(450), ctx.status(401))
    // return res(ctx.delay(450), ctx.status(500))
    // return res(ctx.delay(450), ctx.status(403), ctx.json({ id, feil: DelbestillingFeil.ULIK_GEOGRAFISK_TILKNYTNING }))
    // return res(ctx.delay(450), ctx.status(404), ctx.json({ id, feil: DelbestillingFeil.INGET_UTLÅN }))

    return res(ctx.delay(450), ctx.status(201), ctx.json({ id: delbestilling.id }))
  }),

  rest.get<{}, {}, Delbestilling[]>(`${API_PATH}/delbestilling`, (req, res, ctx) => {
    return res(ctx.delay(250), ctx.json(tidligereBestillinger))
  }),

  rest.get<{}, {}, Delbestilling[]>(`${API_PATH}/delbestilling/kommune`, (req, res, ctx) => {
    return res(ctx.delay(250), ctx.json(tidligereBestillinger))
  }),
]

export default apiHandlers
