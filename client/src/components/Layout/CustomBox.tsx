import { PropsWithChildren } from 'react'

import { Box } from '@navikt/ds-react'

export const CustomBox = ({ children }: PropsWithChildren) => {
  return (
    <Box padding="space-24" background="default" borderWidth="1" borderRadius="12" borderColor="neutral-subtleA">
      {children}
    </Box>
  )
}
