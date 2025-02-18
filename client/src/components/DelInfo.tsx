import React from 'react'
import styled from 'styled-components'

import { ImageIcon } from '@navikt/aksel-icons'
import { BodyShort, Heading, ReadMore, Tag } from '@navikt/ds-react'

import { size } from '../styledcomponents/rules'
import { Avstand } from './Avstand'
import { Lagerstatus } from '../types/Types'

interface Props {
  navn: string
  hmsnr: string
  levArtNr: string | null
  img: string | null
  lagerstatus?: Lagerstatus
}

const SubtleBodyShort = styled(BodyShort)`
  color: var(--a-text-subtle);
  display: flex;
  gap: 20px;
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
    width: 330px; // Hacky hack, burde heller løses med flex
  }
`

const DelInfo = ({ navn, hmsnr, levArtNr, img, lagerstatus }: Props) => {
  return (
    <>
      <ImgWrap aria-hidden>{img ? <img src={img} alt={navn} /> : <PlaceholderIcon />}</ImgWrap>

      <Beskrivelser>
        <Heading size="small" level="4" spacing>
          {navn}
        </Heading>
        <SubtleBodyShort>
          <span>HMS-nr. {hmsnr}</span>
          {levArtNr && <span>Lev.art.nr. {levArtNr}</span>}
        </SubtleBodyShort>
        {lagerstatus && lagerstatus.minmax === false && (
          <Avstand marginTop={5}>
            <Tag variant="warning">
              Er ikke fast lagervare på HMS{' '}
              {lagerNavnMap[lagerstatus.organisasjons_navn.slice(1, 3)] ?? lagerstatus.organisasjons_navn}
            </Tag>
            <ReadMore header="Jeg trenger denne delen">Du må ta kontakt med din hjelpemiddelsentral.</ReadMore>
          </Avstand>
        )}
      </Beskrivelser>
    </>
  )
}

const lagerNavnMap: { [key: string]: string } = {
  '01': 'Østfold',
  '03': 'Oslo',
  '04': 'Hedmark',
  '05': 'Oppland',
  '06': 'Buskerud',
  '07': 'Vestfold',
  '08': 'Telemark',
  '09': 'Aust-Agder',
  '10': 'Vest-Agder',
  '11': 'Rogaland',
  '12': 'Hordaland',
  '14': 'Sogn og Fjordane',
  '15': 'Møre og Romsdal',
  '16': 'Sør-Trøndelag',
  '17': 'Nord-Trøndelag',
  '18': 'Nordland',
  '19': 'Troms og Finnmark',
  '20': 'Finnmark',
}

export default DelInfo
