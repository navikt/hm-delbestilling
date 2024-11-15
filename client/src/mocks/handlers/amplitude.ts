import { http, HttpResponse } from 'msw'

const amplitudeHandlers = [
  http.post('https://amplitude.nav.no/collect', () => {
    return HttpResponse.json({
      code: 200,
      server_upload_time: 0,
      payload_size_bytes: 0,
      events_ingested: 1,
    })
  }),
  http.post('https://amplitude.nav.no/collect-auto', () => {
    return HttpResponse.json({
      code: 200,
      server_upload_time: 0,
      payload_size_bytes: 0,
      events_ingested: 1,
    })
  }),
]
export default amplitudeHandlers
