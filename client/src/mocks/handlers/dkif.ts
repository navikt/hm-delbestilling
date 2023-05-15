import { rest } from 'msw'
import { DkifResponse } from '../../interfaces/Dkif'
import { API_PATH } from '../../services/rest'

const dkifHandlers = [
  rest.get<{}, DkifResponse>(`${API_PATH}/dkif/spraak/`, (req, res, ctx) => {
    return res(ctx.json({ spraak: 'nb' }))
  }),
]

export default dkifHandlers
