import { rest } from 'msw'
import { StatusCodes } from 'http-status-codes'

const authHandlers = [
  rest.get('/hjelpemidler/delbestilling/auth/status', (req, res, ctx) => {
    return res(ctx.status(StatusCodes.OK))
  }),
]

export default authHandlers
