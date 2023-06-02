import { rest } from 'msw'
import { OppslagFeil, OppslagResponse } from '../../types/ResponseTypes'
import hjelpemiddelMock from '../../services/hjelpemiddel-mock.json'
import { Hjelpemiddel, InnsendtBestilling } from '../../types/Types'
import { API_PATH } from '../../services/rest'

let tidligereBestillinger: InnsendtBestilling[] = []

const apiHandlers = [
  rest.post<{ artnr: string; serienr: string }, {}, OppslagResponse>(`${API_PATH}/oppslag`, (req, res, ctx) => {
    const { artnr, serienr } = req.body

    if (artnr === '333333') {
      return res(ctx.json({ hjelpemiddel: undefined, feil: OppslagFeil.INGET_UTLÅN }))
    }

    const hjelpemiddel: Hjelpemiddel | undefined = hjelpemiddelMock.find((hm) => hm.hmsnr === artnr)

    if (!hjelpemiddel) {
      return res(ctx.json({ hjelpemiddel: undefined, feil: OppslagFeil.TILBYR_IKKE_HJELPEMIDDEL }))
    }

    return res(ctx.delay(250), ctx.json({ hjelpemiddel, feil: undefined }))
  }),

  rest.post<InnsendtBestilling>(`${API_PATH}/delbestilling`, (req, res, ctx) => {
    const { id } = req.body
    tidligereBestillinger.push(req.body)
    return res(ctx.delay(250), ctx.status(201), ctx.body(id))
  }),

  rest.get<{}, {}, InnsendtBestilling[]>(`${API_PATH}/delbestilling`, (req, res, ctx) => {
    return res(ctx.delay(250), ctx.json(tidligereBestillinger))
  }),

  rest.get<{}, {}, InnsendtBestilling[]>(`${API_PATH}/delbestilling/kommune`, (req, res, ctx) => {
    return res(ctx.delay(250), ctx.json(tidligereBestillinger))
  }),
]

export default apiHandlers
