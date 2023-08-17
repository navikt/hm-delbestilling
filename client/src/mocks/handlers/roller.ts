import { rest } from 'msw'

import { DelbestillerrolleResponse } from '../../types/HttpTypes'

const rollerHandlers = [
  rest.get<{}, {}, DelbestillerrolleResponse>('/hjelpemidler/delbestilling/roller/delbestiller', (req, res, ctx) => {
    return res(
      ctx.delay(250),
      ctx.json({
        delbestillerrolle: {
          erTekniker: true,
          erBrukerpassbruker: false,
          kanBestilleDeler: true,
          harXKLager: true,
          erKommunaltAnsatt: true,
          kommunaleOrgs: [
            {
              kommunenummer: '3010',
              navn: 'Oslo kommune',
              næringskoder: [{ kode: '1234', beskrivelse: 'beskrivelse' }],
              orgform: 'KOMM',
              orgnr: '1234',
              overordnetOrgnr: null,
            },
          ],
          erIPilot: true,
        },
      })
    )
  }),
]

export default rollerHandlers
