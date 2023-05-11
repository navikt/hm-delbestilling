import { rest } from 'msw'
import { DelbestillerResponse } from '../../types/ResponseTypes'

const rollerHandlers = [
  rest.get<{}, {}, DelbestillerResponse>('/hjelpemidler/delbestilling/roller/delbestiller', (req, res, ctx) => {
    return res(
      ctx.delay(250),
      ctx.json({ kanBestilleDeler: true, harXKLager: true, erKommunaltAnsatt: true, erIPilot: true })
    )
  }),
]

export default rollerHandlers
