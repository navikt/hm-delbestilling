import styled from 'styled-components'
import { size } from '../styledcomponents/rules'

const DelInnhold = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: ${size.large}) {
    justify-content: space-between;
    align-items: flex-end;
    flex-direction: row;
  }
`

export default DelInnhold
