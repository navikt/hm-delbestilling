import { PropsWithChildren, ComponentProps } from 'react'

import { Box } from '@navikt/ds-react'

interface CustomBoxProps {
  children: React.ReactNode
  background?: ComponentProps<typeof Box>['background']
}

export const CustomBox = ({ children, background }: CustomBoxProps) => {
  return (
    <Box padding="space-24" background={background || 'default'} borderWidth="1" borderRadius="12" borderColor="neutral-subtleA">
      {children}
    </Box>
  )
}
