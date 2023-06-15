import React from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'
import styled from 'styled-components'
import { ImageIcon } from '@navikt/aksel-icons'
import { size } from '../styledcomponents/rules'

interface Props {
  navn: string
  hmsnr: string
  levArtNr: string | null
  img: string | null
}

const SubtleBodyShort = styled(BodyShort)`
  color: var(--a-text-subtle);
`

const ImgWrap = styled.div`
  width: 100%;
  height: 200px;
  background: #439e3e;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (min-width: ${size.large}) {
    width: 200px;
  }

  img {
    width: 100%;
    height: 200px;
    @media (min-width: ${size.large}) {
      width: 200px;
    }
    object-fit: cover;
  }
`

const Beskrivelser = styled.div`
  @media (min-width: ${size.large}) {
    width: 287px; // Hacky hack, burde heller løses med flex
  }
`

const DelInfo = ({ navn, hmsnr, levArtNr, img }: Props) => {
  return (
    <>
      <ImgWrap>{img ? <img src={img} alt={navn} /> : <ImageIcon style={{ width: 100, height: 100 }} />}</ImgWrap>

      <Beskrivelser>
        <Heading size="small" level="4" spacing>
          {navn}
        </Heading>
        <SubtleBodyShort>
          HMS-nr: {hmsnr} {levArtNr && <>| Lev.art.nr: {levArtNr}</>}
        </SubtleBodyShort>
      </Beskrivelser>
    </>
  )
}

export default DelInfo
