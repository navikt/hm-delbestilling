import styled from 'styled-components'

import { Panel } from '@navikt/ds-react'

export const CustomPanel = styled(Panel)`
  border-color: var(--a-border-subtle);
  padding: 24px;
`

export const SentrertContent = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  padding: 20px;
`
