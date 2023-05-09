import { rest } from 'msw'

const amplitudeHandlers = [
  rest.post('https://amplitude.nav.no/collect-auto', (req, res, ctx) => {
    return res(ctx.text('success'))
  }),
]
export default amplitudeHandlers
