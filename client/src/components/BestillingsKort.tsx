import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BodyShort, Button, Heading, Label, Link, Panel, Tag, TagProps } from '@navikt/ds-react'

import { Delbestilling, DelbestillingSak, Levering, Status } from '../types/Types'

import { Avstand } from './Avstand'

const HeaderRekke = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  h3 {
    flex: 1;
  }
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
  return (
    <Avstand marginBottom={2}>
      <Panel border>
        <HeaderRekke>
          <Heading size="small" level="3">
            Hmsnr: {sak.delbestilling.hmsnr} Serienr: {sak.delbestilling.serienr}
          </Heading>
          {/* <Tag variant={etikettType} size="small">
            {t(`bestillinger.status.${sak.status}`)}
          </Tag> */}
        </HeaderRekke>
        <Avstand marginBottom={4} />
        {sak.delbestilling.deler.map((delLinje, index) => (
          <DelRekke key={index}>
            <BodyShort size="medium">{delLinje.del.navn}</BodyShort>
            <Label size="medium">{delLinje.antall} stk</Label>
          </DelRekke>
        ))}
        <Avstand marginBottom={4} />
        <InfoLinje>
          <div>
            <Label size="small">{t('bestillinger.kort.opprettet')}:</Label>
            <BodyShort size="small">{datoString}</BodyShort>
          </div>
          <div>
            <Label size="small">{t('bestillinger.kort.levering')}:</Label>
            <BodyShort size="small">
              {sak.delbestilling.levering === Levering.TIL_XK_LAGER
                ? t('bestillinger.tilXKLager')
                : t('bestillinger.serviceOppdrag')}
            </BodyShort>
          </div>
        </InfoLinje>
      </Panel>
    </Avstand>
  )
}

export default BestillingsKort
