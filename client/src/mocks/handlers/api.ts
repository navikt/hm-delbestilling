import { rest } from 'msw'
import { OppslagResponse } from '../../types/ResponseTypes'
import hjelpemiddelMock from '../../services/hjelpemiddel-mock.json'
import { Delbestilling, Hjelpemiddel, TidligereBestillinger } from '../../types/Types'

let tidligereBestillinger: TidligereBestillinger[] = []

const apiHandlers = [
  rest.post<{ artNr: string; serieNr: string }, {}, OppslagResponse>(
    '/hjelpemidler/delbestilling/api/oppslag',
    (req, res, ctx) => {
      const { artNr, serieNr } = req.body

      if (!artNr || !serieNr) return res(ctx.status(400))

      if (serieNr === '000000') {
        return res(ctx.json({ serieNrKobletMotBruker: false }))
      }

      const hjelpemiddel: Hjelpemiddel | undefined = hjelpemiddelMock.find((hm) => hm.hmsnr === artNr)

      if (!hjelpemiddel) return res(ctx.status(404))

      return res(ctx.delay(250), ctx.json({ serieNrKobletMotBruker: true, hjelpemiddel }))
    }
  ),

  rest.post<{ id: string; hmsnr: string; serienr: string; deler: Delbestilling[] }>(
    '/hjelpemidler/delbestilling/api/delbestilling',
    (req, res, ctx) => {
      const { id } = req.body
      tidligereBestillinger.push(req.body as TidligereBestillinger)
      return res(ctx.delay(250), ctx.status(201), ctx.body(id))
    }
  ),

  rest.get<{ id: string }, {}, TidligereBestillinger[]>(
    '/hjelpemidler/delbestilling/api/delbestilling',
    (req, res, ctx) => {
      return res(ctx.delay(250), ctx.json(tidligereBestillinger))
    }
  ),
]

export default apiHandlers
