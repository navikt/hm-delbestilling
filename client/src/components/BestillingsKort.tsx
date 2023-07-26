import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Delbestilling, Levering } from '../types/Types'
import { BodyShort, Button, Heading, Label, Link, Panel, Tag, TagProps } from '@navikt/ds-react'
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

const HøyreJustert = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 5px;
`

interface Props {
  delbestilling: Delbestilling
}

function tagStatusFraOrdreStatus(status?: string): TagProps['variant'] {
  switch (status) {
    default:
      return 'info'
  }
}

const BestillingsKort = ({ delbestilling }: Props) => {
  const { t } = useTranslation()
  const etikettType = tagStatusFraOrdreStatus()
  return (
    <Avstand marginBottom={2}>
      <Panel border>
        <HeaderRekke>
          <Heading size="small" level="3">
            Hmsnr: {delbestilling.hmsnr}
          </Heading>
          <Tag variant={etikettType} size="small">
            Ukjent status
          </Tag>
        </HeaderRekke>
        <Avstand marginBottom={4} />
        {delbestilling.deler.map((delLinje) => (
          <>
            <DelRekke key={delLinje.del.hmsnr}>
              <BodyShort size="small">{delLinje.del.navn}</BodyShort>
              <Label size="small">{delLinje.antall}</Label>
            </DelRekke>
          </>
        ))}
        <HøyreJustert>
          <Label>Levering:</Label>
          <BodyShort>
            {delbestilling.levering === Levering.TIL_XK_LAGER
              ? t('bestillinger.tilXKLager')
              : t('bestillinger.serviceOppdrag')}
          </BodyShort>
        </HøyreJustert>
      </Panel>
    </Avstand>
  )
}

export default BestillingsKort
