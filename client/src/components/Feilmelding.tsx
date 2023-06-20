import { Alert, AlertProps, ExpansionCard } from '@navikt/ds-react'
import React from 'react'
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
              <ExpansionCard.Content>{JSON.stringify(feilmelding.tekniskFeilmelding)}</ExpansionCard.Content>
            </ExpansionCard>
          </Avstand>
        )}
      </>
    </Alert>
  )
}

export { type FeilmeldingInterface, Feilmelding }
