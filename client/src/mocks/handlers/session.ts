import { rest } from 'msw'

const oppslagHandlers = [
  rest.get('/hjelpemidler/delbestilling/session', (req, res, ctx) => {
    return res(ctx.status(200))
  }),
]

export default oppslagHandlers
