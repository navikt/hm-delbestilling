import { useTranslation } from 'react-i18next'

import { BodyShort, Heading, HStack, VStack } from '@navikt/ds-react'

import { Del } from '../types/Types'

interface InfoOmDelProps {
  del: Del
  erFastLagervare: boolean
}

const InfoOmDel = ({ del, erFastLagervare }: InfoOmDelProps) => {
  const { t } = useTranslation()

  const getDelType = () => {
    if (del.erReservedel) return t('del.type.reservedel')
    if (del.erTilbehør) return t('del.type.tilbehor')
    if (!del.erReservedel && !del.erTilbehør) return t('del.type.ikkeReservedelEllerTilbehor')
    if (del.erReservedel && del.erTilbehør) return t('del.type.badeReservedelOgTilbehor')
    return ''
  }

  return (
    <>
      <Heading size="small" level="4" spacing>
        {del.navn}
      </Heading>

      <VStack gap="space-12">
        <HStack gap="space-20">
          <BodyShort textColor="subtle">HMS-nr. {del.hmsnr}</BodyShort>
          {del.levArtNr && <BodyShort textColor="subtle">Lev.art.nr. {del.levArtNr}</BodyShort>}
        </HStack>
        <VStack gap="space-6">
          <BodyShort textColor="subtle">{getDelType()}</BodyShort>
          <BodyShort>{erFastLagervare ? t('del.lagervare') : t('del.bestillingsvare')}</BodyShort>
        </VStack>
      </VStack>
    </>
  )
}

export default InfoOmDel
