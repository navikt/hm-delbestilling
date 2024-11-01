import { http, HttpResponse } from 'msw'

import { DkifResponse } from '../../interfaces/Dkif'
import { API_PATH } from '../../services/rest'

const dkifHandlers = [
  http.get<{}, {}, DkifResponse>(`${API_PATH}/dkif/spraak/`, ({ request, params, cookies }) => {
    return HttpResponse.json({ spraak: 'nb' })
  }),
]

export default dkifHandlers
