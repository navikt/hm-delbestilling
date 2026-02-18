import { BodyShort, Heading, HStack, VStack } from '@navikt/ds-react'

import { Del } from '../types/Types'

interface InfoOmDelProps {
  del: Del
  erFastLagervare: boolean
}

const InfoOmDel = ({ del, erFastLagervare }: InfoOmDelProps) => {
  const getDelType = () => {
    if (del.erReservedel) return 'RESERVEDEL'
    if (del.erTilbehør) return 'TILBEHØR'
    if (!del.erReservedel && !del.erTilbehør) return 'IKKE RESERVEDEL ELLER TILBEHØR'
    if (del.erReservedel && del.erTilbehør) return 'BÅDE RESERVEDEL OG TILBEHØR'
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
          <BodyShort>{erFastLagervare ? 'Lagervare' : 'Bestillingsvare'}</BodyShort>
        </VStack>
      </VStack>
    </>
  )
}

export default InfoOmDel
