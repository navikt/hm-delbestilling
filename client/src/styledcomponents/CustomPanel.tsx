import styled from 'styled-components'

import { Panel } from '@navikt/ds-react'

export const CustomPanel = styled(Panel)`
  padding: 24px;
`

export const DottedPanel = styled(CustomPanel)`
  border: 2px dashed var(--a-grayalpha-600);
  background: transparent;
`
