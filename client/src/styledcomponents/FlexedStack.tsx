import styled from 'styled-components'
import { size } from './rules'

const FlexedStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: ${size.large}) {
    flex-direction: row;
  }
`

export default FlexedStack
