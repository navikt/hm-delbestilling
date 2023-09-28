import { rest } from 'msw'

import { DelbestillerrolleResponse } from '../../types/HttpTypes'

const rollerHandlers = [
  rest.get<{}, {}, DelbestillerrolleResponse>('/hjelpemidler/delbestilling/roller/delbestiller', (req, res, ctx) => {
    return res(
      ctx.delay(250),
      ctx.json({
        delbestillerrolle: {
          kanBestilleDeler: true,
          harXKLager: true,
          erKommunaltAnsatt: true,
          erIPilot: true,
          kommunaleOrgs: [
            {
              orgnr: '0001',
              navn: 'Oslo Teknikere',
              orgform: 'KOMM',
              overordnetOrgnr: undefined,
              næringskoder: [],
              kommunenummer: '0301',
            },
          ],
        },
      })
    )
  }),
]

export default rollerHandlers
