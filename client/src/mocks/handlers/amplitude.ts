import { rest } from 'msw'

const amplitudeHandlers = [
  rest.post('https://amplitude.nav.no/collect-auto', (req, res, ctx) => {
    return res(
      ctx.json({
        code: 200,
        server_upload_time: 0,
        payload_size_bytes: 0,
        events_ingested: 1,
      })
    )
  }),
]
export default amplitudeHandlers
