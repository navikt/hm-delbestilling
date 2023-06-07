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
      return res(ctx.json({ hjelpemiddel: undefined, feil: OppslagFeil.INGET_UTLÅN }))
    }

    const hjelpemiddel: Hjelpemiddel | undefined = hjelpemiddelMock.find((hm) => hm.hmsnr === hmsnr)

    if (!hjelpemiddel) {
      return res(ctx.json({ hjelpemiddel: undefined, feil: OppslagFeil.TILBYR_IKKE_HJELPEMIDDEL }))
    }

    return res(ctx.delay(250), ctx.json({ hjelpemiddel, feil: undefined }))
  }),

  rest.post<DelbestillingRequest, {}, DelbestillingResponse>(`${API_PATH}/delbestilling`, (req, res, ctx) => {
    const { delbestilling } = req.body

    if (!delbestilling || !delbestilling.deler || !delbestilling.hmsnr || !delbestilling.serienr) {
      return res(ctx.status(400))
    }

    const id = delbestilling.id

    tidligereBestillinger.push(delbestilling)

    if (delbestilling.serienr === '999999') {
      return res(ctx.delay(450), ctx.json({ id, feil: DelbestillingFeil.BRUKER_IKKE_FUNNET }))
    }

    // return res(ctx.delay(450), ctx.status(401))
    // return res(ctx.delay(450), ctx.status(500))
    // return res(ctx.delay(450), ctx.json({ id, feil: DelbestillingFeil.ULIK_GEOGRAFISK_TILKNYTNING }))
    // return res(ctx.delay(450), ctx.json({ id, feil: DelbestillingFeil.INGET_UTLÅN }))

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
