import { StatusCodes } from 'http-status-codes'
import { rest } from 'msw'

const authHandlers = [
  rest.get('/hjelpemidler/delbestilling/auth/status', (req, res, ctx) => {
    return res(ctx.delay(150), ctx.status(StatusCodes.OK))
  }),
]

export default authHandlers
