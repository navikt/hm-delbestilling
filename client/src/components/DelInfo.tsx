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
  height: 150px;
  background: #ececec;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (min-width: ${size.large}) {
    width: 150px;
  }

  img {
    width: 100%;
    height: 150px;
    @media (min-width: ${size.large}) {
      width: 150px;
    }
    object-fit: cover;
  }
`

const PlaceholderIcon = styled(ImageIcon)`
  width: 75px;
  height: 75px;
  color: var(--a-gray-500);
`

const Beskrivelser = styled.div`
  @media (min-width: ${size.large}) {
    width: 340px; // Hacky hack, burde heller løses med flex
  }
`

const DelInfo = ({ navn, hmsnr, levArtNr, img }: Props) => {
  return (
    <>
      <ImgWrap>{img ? <img src={img} alt={navn} /> : <PlaceholderIcon />}</ImgWrap>

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
