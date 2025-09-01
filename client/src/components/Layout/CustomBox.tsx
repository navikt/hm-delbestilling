import { PropsWithChildren } from 'react'

import { Box } from '@navikt/ds-react'

export const CustomBox = ({ children }: PropsWithChildren) => {
  return (
    <Box.New padding="6" background="default" borderWidth="1" borderRadius="12">
      {children}
    </Box.New>
  )
}
