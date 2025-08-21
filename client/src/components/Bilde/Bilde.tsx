import { useState } from 'react'

import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, MagnifyingGlassFillIcon } from '@navikt/aksel-icons'
import { Box, Button, HGrid, HStack, Modal } from '@navikt/ds-react'

import { logÅpningAvBildekarusell } from '../../utils/amplitude'

import styles from './Bilde.module.css'

export const Bilde = ({ imgs, navn }: { imgs: string[]; navn: string }) => {
  if (imgs.length === 0) {
    return (
      <div className={styles.imgWrap}>
        <ImageIcon className={styles.placeholderIcon} />
      </div>
    )
  }

  return <Karusell imgs={imgs} navn={navn} />
}

const Karusell = ({ imgs, navn }: { imgs: string[]; navn: string }) => {
  const [valgtIndex, setValgtIndex] = useState<number>(-1)

  return (
    <>
      <button
        className={styles.thumbnailButton}
        onClick={() => {
          setValgtIndex(0)
          logÅpningAvBildekarusell()
        }}
      >
        <div className={styles.imgWrap} aria-hidden style={{ position: 'relative' }}>
          <img src={imgs[0]} alt={navn} />
          <div className={styles.magnifyer}>
            <MagnifyingGlassFillIcon style={{ color: 'white' }} />
          </div>
        </div>
      </button>
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
                    <button key={i} className={styles.thumbnailButton} onClick={() => setValgtIndex(i)}>
                      <Box
                        borderColor={valgtIndex === i ? 'border-strong' : 'border-subtle'}
                        borderWidth="2"
                        style={{ display: 'flex' }}
                      >
                        <img src={url} alt={navn} style={{ width: '100%' }} />
                      </Box>
                    </button>
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
