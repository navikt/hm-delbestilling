import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import styled from 'styled-components'

import { BodyShort, Detail, Heading } from '@navikt/ds-react'

import { useRolleContext } from '../context/rolle'
import { DelLinje, Levering } from '../types/Types'
import { logPrintKvitteringÅpnet } from '../utils/amplitude'

import { Avstand } from './Avstand'

const PrintWrap = styled.div`
  @media print {
    padding: 20px;
  }
`

const DelRekke = styled.div`
  display: flex;
  justify-content: space-between;
  :not(:last-child) {
    margin-bottom: 0.5rem;
  }
`

interface Props {
  printErAktiv: boolean
  hjelpemiddel: {
    navn: string
    hmsnr: string
    serienr: string
  }
  deler: DelLinje[]
  levering: Levering | undefined
  opprettet: Date
  saksnummer: string
  onClose(): void
}

const BestillingsOppsummering = ({
  printErAktiv,
  hjelpemiddel,
  deler,
  levering,
  opprettet,
  saksnummer,
  onClose,
}: Props) => {
  const printRef = useRef<HTMLDivElement>(null)

  const { delbestillerrolle } = useRolleContext()
  const { t } = useTranslation()

  useEffect(() => {
    if (printErAktiv) {
      handlePrint()
    }
  }, [printErAktiv])

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforePrint: () => {
      logPrintKvitteringÅpnet()
    },
    onAfterPrint: () => onClose(),
    documentTitle: `kvittering_delbestilling_${saksnummer}`,
  })

  return (
    <PrintWrap ref={printRef}>
      <Heading size="small" level="3">
        {t('bestillinger.bestillingTil', { navn: hjelpemiddel.navn })}
      </Heading>
      <Detail style={{ display: 'flex', gap: '1rem' }}>
        <span>Art.nr. {hjelpemiddel.hmsnr}</span>
        <span>Serienr. {hjelpemiddel.serienr}</span>
      </Detail>
      <Avstand marginBottom={4} />
      {deler.map((delLinje, index) => (
        <DelRekke key={index}>
          <BodyShort size="medium">{delLinje.del.navn}</BodyShort>
          <BodyShort size="medium">{delLinje.antall} stk</BodyShort>
        </DelRekke>
      ))}
      <Avstand marginBottom={4} />

      <BodyShort size="small" spacing>
        {t('bestillinger.kort.innsendt')}{' '}
        {opprettet.toLocaleString('no', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </BodyShort>

      {delbestillerrolle.harXKLager && (
        <BodyShort size="small" spacing>
          {levering === Levering.TIL_XK_LAGER ? t('bestillinger.tilXKLager') : t('bestillinger.serviceOppdrag')}
        </BodyShort>
      )}

      <BodyShort size="small">Saksnummer: {saksnummer}</BodyShort>
    </PrintWrap>
  )
}

export default BestillingsOppsummering
