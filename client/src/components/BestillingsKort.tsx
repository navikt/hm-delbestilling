import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BodyShort, Detail, Heading, Panel } from '@navikt/ds-react'

import { useRolleContext } from '../context/rolle'
import { formaterNorskDato } from '../helpers/utils'
import { DelbestillingSak, Levering, Ordrestatus } from '../types/Types'

import { Avstand } from './Avstand'
import DellinjestatusTag from './DellinjestatusTag'
import OrdrestatusTag from './OrdrestatusTag'

const DelRekke = styled.div`
  display: flex;
  flex-direction: row;
  p:first-child {
    flex: 1;
  }
`

const Dellinje = styled.div`
  border-bottom: 1px solid var(--a-gray-300);
  :not(:last-child) {
    margin-bottom: 0.5rem;
  }
  padding: 8px 0;
`

interface Props {
  sak: DelbestillingSak
}

const BestillingsKort = ({ sak }: Props) => {
  const { t } = useTranslation()
  const { delbestillerrolle } = useRolleContext()

  const visOrdrestatusTag =
    sak.status !== Ordrestatus.DELVIS_SKIPNINGSBEKREFTET && sak.status !== Ordrestatus.SKIPNINGSBEKREFTET

  return (
    <Avstand marginBottom={4}>
      <Panel border>
        <Heading size="small" level="3">
          {/* TODO: fjern sjekk når alle produkter har fått navn */}
          {sak.delbestilling.navn ? <>Bestilling til {sak.delbestilling.navn}</> : <>Bestilling</>}
        </Heading>
        <Detail style={{ display: 'flex', gap: '1rem' }}>
          <span>Art.nr. {sak.delbestilling.hmsnr}</span>
          <span>Serienr. {sak.delbestilling.serienr}</span>
        </Detail>
        <Avstand marginBottom={4} />
        {sak.delbestilling.deler.map((dellinje, index) => (
          <Dellinje key={index}>
            <DelRekke>
              <BodyShort size="medium">{dellinje.del.navn}</BodyShort>
              <BodyShort size="medium">{dellinje.antall} stk</BodyShort>
            </DelRekke>
            {!visOrdrestatusTag && <DellinjestatusTag dellinje={dellinje} />}
          </Dellinje>
        ))}
        <Avstand marginBottom={4} />

        {delbestillerrolle.harXKLager && (
          <BodyShort size="small" spacing>
            <strong>
              {sak.delbestilling.levering === Levering.TIL_XK_LAGER
                ? t('bestillinger.tilXKLager')
                : t('bestillinger.serviceOppdrag')}
            </strong>
          </BodyShort>
        )}

        <BodyShort size="small" spacing>
          {t('bestillinger.kort.innsendt')} {formaterNorskDato(sak.opprettet)}
        </BodyShort>

        {visOrdrestatusTag && <OrdrestatusTag sak={sak} />}
      </Panel>
    </Avstand>
  )
}

export default BestillingsKort
