import { StatusCodes } from 'http-status-codes'
import { rest } from 'msw'

const authHandlers = [
  rest.get('/hjelpemidler/delbestilling/auth/status', (req, res, ctx) => {
    return res(ctx.status(StatusCodes.OK))
  }),
]

export default authHandlers
