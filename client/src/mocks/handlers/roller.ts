import { rest } from 'msw'

import { DelbestillerrolleResponse } from '../../types/HttpTypes'

const rollerHandlers = [
  rest.get<{}, {}, DelbestillerrolleResponse>('/hjelpemidler/delbestilling/roller/delbestiller', (req, res, ctx) => {
    return res(
      ctx.delay(250),
      ctx.json({
        delbestillerrolle: { kanBestilleDeler: true, harXKLager: true, erKommunaltAnsatt: true, erIPilot: true },
      })
    )
  }),
]

export default rollerHandlers
