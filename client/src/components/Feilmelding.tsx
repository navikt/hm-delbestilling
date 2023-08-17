import React from 'react'

import { Alert, AlertProps, ExpansionCard } from '@navikt/ds-react'

import { Avstand } from './Avstand'

interface FeilmeldingInterface {
  variant?: AlertProps['variant']
  feilmelding: React.ReactNode
  tekniskFeilmelding?: any
}

interface Props {
  feilmelding: FeilmeldingInterface
}

const Feilmelding = ({ feilmelding }: Props) => {
  return (
    <Alert variant={feilmelding.variant ?? 'error'} data-cy="feilmelding">
      <>
        {feilmelding.feilmelding}
        {feilmelding.tekniskFeilmelding && (
          <Avstand marginTop={2}>
            <ExpansionCard size="small" aria-label="informasjon for utviklere">
              <ExpansionCard.Header>
                <ExpansionCard.Title size="small">Informasjon for utviklere</ExpansionCard.Title>
              </ExpansionCard.Header>
              <ExpansionCard.Content>
                <pre>{JSON.stringify(feilmelding.tekniskFeilmelding, null, 2)}</pre>
              </ExpansionCard.Content>
            </ExpansionCard>
          </Avstand>
        )}
      </>
    </Alert>
  )
}

export { Feilmelding, type FeilmeldingInterface }
