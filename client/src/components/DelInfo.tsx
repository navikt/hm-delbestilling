import React from 'react'
import styled from 'styled-components'

import { ImageIcon } from '@navikt/aksel-icons'
import { BodyShort, Detail, Heading } from '@navikt/ds-react'

import { size } from '../styledcomponents/rules'
import { Avstand } from './Avstand'
import { Lagerstatus } from '../types/Types'
import { useTranslation } from 'react-i18next'

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

interface Props {
  navn: string
  hmsnr: string
  levArtNr: string | null
  img: string | null
  lagerstatus?: Lagerstatus
  visVarselOmIkkeLagervare?: boolean
}

const DelInfo = ({ navn, hmsnr, levArtNr, img, lagerstatus, visVarselOmIkkeLagervare }: Props) => {
  const { t } = useTranslation()
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
        {lagerstatus && visVarselOmIkkeLagervare && (
          <Avstand marginTop={5}>
            <Detail textColor="subtle">
              {t('del.lagerstatus.ikkeFastLagervare', {
                hmsNavn: lagerNavnMap[lagerstatus.organisasjons_navn.slice(1, 3)] ?? lagerstatus.organisasjons_navn,
              })}
            </Detail>
          </Avstand>
        )}
      </Beskrivelser>
    </>
  )
}

const lagerNavnMap: { [key: string]: string } = {
  '01': 'Øst-Viken',
  '02': 'Oslo',
  '03': 'Oslo',
  '04': 'Elverum',
  '05': 'Gjøvik',
  '06': 'Vest-Viken',
  '07': 'Vestfold og Telemark',
  '08': 'Vestfold og Telemark',
  '09': 'Agder',
  '10': 'Agder',
  '11': 'Rogaland',
  '12': 'Vestland-Bergen',
  '14': 'Vestland-Førde',
  '15': 'Møre og Romsdal',
  '16': 'Trøndelag',
  '17': 'Trøndelag',
  '18': 'Nordland',
  '19': 'Troms og Finnmark',
  '20': 'Troms og Finnmark',
}

export default DelInfo
