import { rest } from 'msw'
import { DkifResponse } from '../../interfaces/Dkif'
import { HM_SOKNAD_API_PATH } from '../../services/rest-service'

const dkifHandlers = [
  rest.get<{}, DkifResponse>(`${HM_SOKNAD_API_PATH}/dkif/spraak/`, (req, res, ctx) => {
    return res(ctx.json({ spraak: 'nb' }))
  }),
]

export default dkifHandlers
