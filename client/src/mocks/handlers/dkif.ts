import { http, HttpResponse } from 'msw'

import { DkifResponse } from '../../interfaces/Dkif'
import { DELBESTILLING_API_PATH } from '../../services/rest'

const dkifHandlers = [
  http.get<{}, {}, DkifResponse>(`${DELBESTILLING_API_PATH}/dkif/spraak/`, ({ request, params, cookies }) => {
    return HttpResponse.json({ spraak: 'nb' })
  }),
]

export default dkifHandlers
