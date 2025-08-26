import { PropsWithChildren } from 'react'

import { Box } from '@navikt/ds-react'

export const CustomBox = ({ children }: PropsWithChildren) => {
  return (
    <Box padding="6" background="bg-default" borderWidth="1" borderColor="border-default">
      {children}
    </Box>
  )
}
