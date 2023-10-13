import React, { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'

import { BodyShort, Heading, LinkPanel } from '@navikt/ds-react'

import { Hjelpemiddel } from '../types/Types'

import { Avstand } from './Avstand'

interface Props {
  hjelpemiddel: Hjelpemiddel
  aktiv: boolean
  setAktivtHjelpemiddel: Dispatch<SetStateAction<Hjelpemiddel | undefined>>
}

const HjelpemiddelKnapp = ({ hjelpemiddel, aktiv, setAktivtHjelpemiddel }: Props) => {
  const { t } = useTranslation()
  const { navn, deler } = hjelpemiddel
  const antallTilgjengeligeDeler = deler?.length || 0
  return (
    <>
      <LinkPanel border={aktiv} onClick={() => setAktivtHjelpemiddel(hjelpemiddel)}>
        <Heading size="xsmall" level="4" spacing>
          {navn}
        </Heading>
        <BodyShort>
          <strong>{t('oversikt.antallDeler')}:</strong> {antallTilgjengeligeDeler}
        </BodyShort>
      </LinkPanel>
      <Avstand marginBottom={4} />
    </>
  )
}

export default HjelpemiddelKnapp
