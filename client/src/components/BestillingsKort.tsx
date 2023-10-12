import React, { useMemo } from 'react'
import { Hmac } from 'crypto'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { PrinterSmallIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Detail, Heading, Label, Link, Panel, Tag, TagProps } from '@navikt/ds-react'

import { useRolleContext } from '../context/rolle'
import { Delbestilling, DelbestillingSak, Levering, Status } from '../types/Types'

import { Avstand } from './Avstand'

const Toolbar = styled.div`
  border-top: 1px solid;
  margin-top: 20px;
  padding-top: 16px;
  text-align: right;
`

const DelRekke = styled.div`
  display: flex;
  flex-direction: row;
  p:first-child {
    flex: 1;
  }
  :not(:last-child) {
    margin-bottom: 0.5rem;
  }
`

const InfoLinje = styled.div`
  display: flex;
  flex-direction: row;
  div {
    display: flex;
    flex-direction: row;
    gap: 5px;
  }
  div:first-child {
    flex: 1;
  }
`

interface Props {
  sak: DelbestillingSak
}

function tagTypeForStatus(status: Status): TagProps['variant'] {
  switch (status) {
    case 'INNSENDT':
      return 'neutral'
    case 'KLARGJORT':
    case 'REGISTRERT':
      return 'info'
    default:
      return 'info'
  }
}

const BestillingsKort = ({ sak }: Props) => {
  const { t } = useTranslation()
  const etikettType = tagTypeForStatus(sak.status)
  const datoString = sak.opprettet.toLocaleString('no', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const { delbestillerrolle } = useRolleContext()
  return (
    <Avstand marginBottom={4}>
      <Panel border style={{ position: 'relative' }}>
        <Heading size="small" level="3">
          {/* TODO: fjern sjekk når alle produkter har fått navn */}
          {sak.delbestilling.navn ? <>Bestilling til {sak.delbestilling.navn}</> : <>Bestilling</>}
        </Heading>
        <Detail style={{ display: 'flex', gap: '1rem' }}>
          <span>Art.nr. {sak.delbestilling.hmsnr}</span>
          <span>Serienr. {sak.delbestilling.serienr}</span>
        </Detail>
        <Avstand marginBottom={4} />
        {sak.delbestilling.deler.map((delLinje, index) => (
          <DelRekke key={index}>
            <BodyShort size="medium">{delLinje.del.navn}</BodyShort>
            <BodyShort size="medium">{delLinje.antall} stk</BodyShort>
          </DelRekke>
        ))}
        <Avstand marginBottom={4} />

        <BodyShort size="small" spacing>
          {t('bestillinger.kort.innsendt')} {datoString}
        </BodyShort>

        {delbestillerrolle.harXKLager && (
          <BodyShort size="small">
            {sak.delbestilling.levering === Levering.TIL_XK_LAGER
              ? t('bestillinger.tilXKLager')
              : t('bestillinger.serviceOppdrag')}
          </BodyShort>
        )}

        <Toolbar>
          <Button icon={<PrinterSmallIcon />} variant="secondary">
            Skriv ut
          </Button>
        </Toolbar>
      </Panel>
    </Avstand>
  )
}

export default BestillingsKort
