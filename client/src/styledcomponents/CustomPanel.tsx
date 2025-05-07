import styled from 'styled-components'

import { Box } from '@navikt/ds-react'

export const CustomPanel = styled(Box)`
  padding: 24px;
  background: var(--a-bg-default);
  border: 1px solid var(--a-grayalpha-600);
`

export const DottedPanel = styled(CustomPanel)`
  border: 2px dashed var(--a-grayalpha-600);
  background: transparent;
`
