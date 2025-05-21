import { styled } from 'styled-components'

import { size } from '../styledcomponents/rules'

export const Beskrivelser = styled.div`
  @media (min-width: ${size.large}) {
    width: 330px; // Hacky hack, burde heller løses med flex
  }
`
