import { useState } from 'react'
import { styled } from 'styled-components'

import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, MagnifyingGlassFillIcon } from '@navikt/aksel-icons'
import { Box, Button, HGrid, HStack, Modal } from '@navikt/ds-react'

import { size } from '../styledcomponents/rules'
import { logÅpningAvBildekarusell } from '../utils/analytics/analytics'

const ImgWrap = styled.div`
  width: 100%;
  height: 150px;
  background: var(--a-gray-100);
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

export const Bilde = ({ imgs, navn }: { imgs: string[]; navn: string }) => {
  if (imgs.length === 0) {
    return (
      <ImgWrap>
        <PlaceholderIcon />
      </ImgWrap>
    )
  }

  return <Karusell imgs={imgs} navn={navn} />
}

const Magnifyer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0 0 0 50%;
`

const Karusell = ({ imgs, navn }: { imgs: string[]; navn: string }) => {
  const [valgtIndex, setValgtIndex] = useState<number>(-1)

  return (
    <>
      <ThumbnailButton
        onClick={() => {
          setValgtIndex(0)
          logÅpningAvBildekarusell()
        }}
      >
        <ImgWrap aria-hidden style={{ position: 'relative' }}>
          <img src={imgs[0]} alt={navn} />
          <Magnifyer>
            <MagnifyingGlassFillIcon style={{ color: 'white' }} />
          </Magnifyer>
        </ImgWrap>
      </ThumbnailButton>
      {valgtIndex > -1 && (
        <Modal aria-label="Galleri" open onClose={() => setValgtIndex(-1)} closeOnBackdropClick>
          <Modal.Header closeButton>{navn}</Modal.Header>

          <Modal.Body>
            <HStack justify="center">
              <img src={imgs[valgtIndex].replace('400d', '1600d')} alt={navn} style={{ width: '100%' }} />
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
