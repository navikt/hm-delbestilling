import { rest } from 'msw'

import { DelbestillerrolleResponse } from '../../types/HttpTypes'

const rollerHandlers = [
  rest.get<{}, {}, DelbestillerrolleResponse>('/hjelpemidler/delbestilling/roller/delbestiller', (req, res, ctx) => {
    return res(
      ctx.delay(250),
      ctx.json({
        delbestillerrolle: {
          erTekniker: false,
          erBrukerpassbruker: true,
          kanBestilleDeler: true,
          harXKLager: false,
          erKommunaltAnsatt: true,
          kommunaleOrgs: [
            {
              orgnr: '0001',
              navn: 'Oslo Teknikere',
              orgform: 'KOMM',
              overordnetOrgnr: null,
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
