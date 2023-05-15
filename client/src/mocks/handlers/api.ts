import { rest } from 'msw'
import { OppslagResponse } from '../../types/ResponseTypes'
import hjelpemiddelMock from '../../services/hjelpemiddel-mock.json'
import { Hjelpemiddel, InnsendtBestilling } from '../../types/Types'
import { API_PATH } from '../../services/rest'

let tidligereBestillinger: InnsendtBestilling[] = []

const apiHandlers = [
  rest.post<{ artNr: string; serieNr: string }, {}, OppslagResponse>(`${API_PATH}/oppslag`, (req, res, ctx) => {
    const { artNr, serieNr } = req.body

    if (!artNr || !serieNr) return res(ctx.status(400))

    if (serieNr === '000000') {
      return res(ctx.json({ serieNrKobletMotBruker: false }))
    }

    const hjelpemiddel: Hjelpemiddel | undefined = hjelpemiddelMock.find((hm) => hm.hmsnr === artNr)

    if (!hjelpemiddel) return res(ctx.status(404))

    return res(ctx.delay(250), ctx.json({ serieNrKobletMotBruker: true, hjelpemiddel }))
  }),

  rest.post<InnsendtBestilling>(`${API_PATH}/delbestilling`, (req, res, ctx) => {
    const { id } = req.body
    tidligereBestillinger.push(req.body)
    return res(ctx.delay(250), ctx.status(201), ctx.body(id))
  }),

  rest.get<{ id: string }, {}, InnsendtBestilling[]>(`${API_PATH}/delbestilling`, (req, res, ctx) => {
    return res(ctx.delay(250), ctx.json(tidligereBestillinger))
  }),
]

export default apiHandlers
