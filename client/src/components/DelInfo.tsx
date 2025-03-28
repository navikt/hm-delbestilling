import React, { useState } from 'react'
import styled from 'styled-components'

import { ChevronLeftIcon, ChevronRightIcon, ImageIcon } from '@navikt/aksel-icons'
import { BodyShort, Box, Button, Detail, Heading, HGrid, HStack, Modal } from '@navikt/ds-react'

import { size } from '../styledcomponents/rules'
import { Avstand } from './Avstand'
import { Lagerstatus } from '../types/Types'
import { useTranslation } from 'react-i18next'
import { logÅpningAvBildekarusell } from '../utils/amplitude'

interface Props {
  navn: string
  hmsnr: string
  levArtNr: string | null
  imgs: string[]
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

const DelInfo = ({ navn, hmsnr, levArtNr, imgs, lagerstatus }: Props) => {
  const { t } = useTranslation()
  return (
    <>
      <Bilde imgs={imgs} navn={navn} />
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

const Bilde = ({ imgs, navn }: { imgs: string[]; navn: string }) => {
  if (imgs.length === 0) {
    return (
      <ImgWrap>
        <PlaceholderIcon />
      </ImgWrap>
    )
  }

  return <Karusell imgs={imgs} navn={navn} />
}

const Karusell = ({ imgs, navn }: { imgs: string[]; navn: string }) => {
  const [valgtIndex, setValgtIndex] = useState<number>(-1)
  console.log('valgtIndex:', valgtIndex)

  return (
    <>
      <ThumbnailButton
        onClick={() => {
          setValgtIndex(0)
          logÅpningAvBildekarusell()
        }}
      >
        <ImgWrap aria-hidden>
          <img src={imgs[0]} alt={navn} />
        </ImgWrap>
      </ThumbnailButton>
      {valgtIndex > -1 && (
        <Modal aria-label="Galleri" open onClose={() => setValgtIndex(-1)} closeOnBackdropClick>
          <Modal.Header closeButton>{navn}</Modal.Header>

          <Modal.Body>
            <HStack justify="center">
              <img src={imgs[valgtIndex].replace('400d', '1600d')} alt={navn} />
            </HStack>
          </Modal.Body>

          <Box padding="4">
            <HStack justify="space-evenly">
              <Button
                disabled={valgtIndex === 0}
                onClick={() => setValgtIndex((prev) => prev - 1)}
                icon={<ChevronLeftIcon />}
                variant="tertiary"
              />
              <div style={{ width: '70%' }}>
                <HGrid columns={{ xs: 4, sm: 4, md: 4 }} gap="4" align="center">
                  {imgs.map((url, i) => (
                    <ThumbnailButton key={i} onClick={() => setValgtIndex(i)}>
                      <Box
                        borderColor={valgtIndex === i ? 'border-strong' : 'border-subtle'}
                        borderWidth="2"
                        style={{ display: 'flex' }}
                      >
                        <img src={url} alt={navn} style={{ width: '100%' }} />
                      </Box>
                    </ThumbnailButton>
                  ))}
                </HGrid>
              </div>

              <Button
                disabled={valgtIndex + 1 === imgs.length}
                onClick={() => setValgtIndex((prev) => prev + 1)}
                icon={<ChevronRightIcon />}
                variant="tertiary"
              />
            </HStack>
          </Box>
        </Modal>
      )}
    </>
  )
}

const ThumbnailButton = styled.button`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
`

export default DelInfo
