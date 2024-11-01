import { StatusCodes } from 'http-status-codes'
import { http, HttpResponse } from 'msw'

const authHandlers = [
  http.get('/hjelpemidler/delbestilling/auth/status', () => {
    return new HttpResponse('Ok', { status: StatusCodes.OK })
  }),
]

export default authHandlers
