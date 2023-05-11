import { rest } from 'msw'

const authHandlers = [
  rest.get('/hjelpemidler/delbestilling/auth/status', (req, res, ctx) => {
    return res(ctx.status(200))
  }),
]

export default authHandlers
