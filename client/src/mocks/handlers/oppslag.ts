import { rest } from 'msw'
import { OppslagResponse } from '../../components/HjelpemiddelLookup'

import hjelpemiddelMock from '../../services/hjelpemiddel-mock.json'
import { Hjelpemiddel } from '../../types/Types'

const oppslagHandlers = [
  rest.post<{ artNr: string; serieNr: string }, {}, OppslagResponse>(
    '/hjelpemidler/delbestilling/api/oppslag',
    // '/api/oppslag',
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
]

export default oppslagHandlers
