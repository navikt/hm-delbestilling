import React from 'react'
import { useTranslation } from 'react-i18next'

import { ExpansionCard, LocalAlert, LocalAlertProps } from '@navikt/ds-react'

import { Avstand } from './Avstand'

interface FeilmeldingInterface {
  status?: LocalAlertProps['status']
  feilmelding: React.ReactNode
  tekniskFeilmelding?: string
}

interface Props {
  feilmelding: FeilmeldingInterface
}

const Feilmelding = ({ feilmelding }: Props) => {
  const { t } = useTranslation()
  return (
    <LocalAlert status={feilmelding.status ?? 'error'} data-cy="feilmelding">
      <LocalAlert.Header>
        <LocalAlert.Title>{t('error.generellFeil')}</LocalAlert.Title>
      </LocalAlert.Header>
      <LocalAlert.Content>
        {feilmelding.feilmelding}
        {feilmelding.tekniskFeilmelding && (
          <Avstand marginTop={2}>
            <ExpansionCard size="small" aria-label="informasjon for utviklere">
              <ExpansionCard.Header>
                <ExpansionCard.Title size="small">{t('error.informasjonForUtviklere')}</ExpansionCard.Title>
              </ExpansionCard.Header>
              <ExpansionCard.Content>{JSON.stringify(feilmelding.tekniskFeilmelding)}</ExpansionCard.Content>
            </ExpansionCard>
          </Avstand>
        )}
      </LocalAlert.Content>
    </LocalAlert>
  )
}

export { Feilmelding, type FeilmeldingInterface }
