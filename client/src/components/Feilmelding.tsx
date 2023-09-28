import React from 'react'
import { useTranslation } from 'react-i18next'

import { Alert, AlertProps, ExpansionCard } from '@navikt/ds-react'

import { Avstand } from './Avstand'

interface FeilmeldingInterface {
  variant?: AlertProps['variant']
  feilmelding: React.ReactNode
  tekniskFeilmelding?: string
}

interface Props {
  feilmelding: FeilmeldingInterface
}

const Feilmelding = ({ feilmelding }: Props) => {
  const { t } = useTranslation()
  return (
    <Alert variant={feilmelding.variant ?? 'error'} data-cy="feilmelding">
      <>
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
      </>
    </Alert>
  )
}

export { Feilmelding, type FeilmeldingInterface }
