import { http, HttpResponse } from 'msw'

const umamiHandlers = [
  http.post('https://umami.nav.no/api/send', () => {
    return HttpResponse.text('ok')
  }),
]

export default umamiHandlers
