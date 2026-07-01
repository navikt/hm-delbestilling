import { useTranslation } from 'react-i18next'

import { PackageIcon, WrenchIcon } from '@navikt/aksel-icons'
import { BodyShort, Heading, HStack, VStack } from '@navikt/ds-react'

import { Del } from '../types/Types'

import styles from './InfoOmDel.module.css'

interface InfoOmDelProps {
  del: Del
  erFastLagervare: boolean
}

const InfoOmDel = ({ del, erFastLagervare }: InfoOmDelProps) => {
  const { t } = useTranslation()

  const getDelType = () => {
    if (del.erReservedel)
      return (
        <HStack gap="space-4" align="center">
          <WrenchIcon title="del-ikon" fontSize="1.5rem" />
          <BodyShort textColor="subtle">{t('del.type.del')}</BodyShort>
        </HStack>
      )
    if (del.erTilbehør)
      return (
        <HStack gap="space-4" align="center">
          <PackageIcon title="tilbehør-ikon" fontSize="1.5rem" />
          <BodyShort textColor="subtle">{t('del.type.tilbehor')}</BodyShort>
        </HStack>
      )
    if (!del.erReservedel && !del.erTilbehør) return <BodyShort textColor="subtle">{t('del.type.ikkeDelEllerTilbehor')}</BodyShort>
    if (del.erReservedel && del.erTilbehør) return <BodyShort textColor="subtle">{t('del.type.badeDelOgTilbehor')}</BodyShort>
    return null
  }

  return (
    <>
      <Heading size="small" level="4" spacing className={styles.utvidetBredde}>
        {del.navn}
      </Heading>

      <VStack gap="space-32">
        <HStack gap="space-20">
          <BodyShort textColor="subtle" size="small">
            HMS-nr. {del.hmsnr}
          </BodyShort>
          {del.levArtNr && (
            <BodyShort textColor="subtle" size="small">
              Lev.art.nr. {del.levArtNr}
            </BodyShort>
          )}
        </HStack>
        <VStack gap="space-6">
          {getDelType()}
          <BodyShort>{erFastLagervare ? t('del.lagervare') : t('del.bestillingsvare')}</BodyShort>
        </VStack>
      </VStack>
    </>
  )
}

export default InfoOmDel
