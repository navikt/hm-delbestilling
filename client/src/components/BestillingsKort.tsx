import React from 'react'
import styled from 'styled-components'
import { Delbestilling, Levering } from '../types/Types'
import {BodyShort, Heading, Label, Panel, Tag, TagProps} from '@navikt/ds-react'
import { Avstand } from './Avstand'
import { useTranslation } from 'react-i18next'

const HeaderRekke = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
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

const LeveringsRekke = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 5px;
`

interface Props {
  bestilling: Delbestilling
}

function tagStatusFraOrdreStatus(status?: string): TagProps['variant'] {
  switch (status) {
    default:
      return 'info'
  }
}

const BestillingsKort = ({ bestilling }: Props) => {
  const { t } = useTranslation()
  const etikettType = tagStatusFraOrdreStatus()
  return (
    <Avstand marginBottom={2}>
      <Panel border>
        <HeaderRekke>
          <Heading size="small" level="3">
            Hmsnr: {bestilling.hmsnr}
          </Heading>
          <Tag variant={etikettType} size="small">
            Ukjent status
          </Tag>
        </HeaderRekke>
        <Avstand marginBottom={4} />
        {bestilling.deler.map((delLinje) => (
          <>
            <DelRekke key={delLinje.del.hmsnr}>
              <BodyShort size="small">{delLinje.del.navn}</BodyShort>
              <Label size="small">{delLinje.antall}</Label>
            </DelRekke>
            <Avstand marginBottom={1} />
          </>
        ))}
        <LeveringsRekke>
          <Label>Levering:</Label>
          <BodyShort>
            {bestilling.levering === Levering.TIL_XK_LAGER
              ? t('bestillinger.tilXKLager')
              : t('bestillinger.serviceOppdrag')}
          </BodyShort>
        </LeveringsRekke>
      </Panel>
    </Avstand>
  )
}

export default BestillingsKort
