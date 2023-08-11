import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { Button } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import { Feilmelding } from '../components/Feilmelding'
import Content from '../styledcomponents/Content'

interface Props {
  error: any
  resetErrorBoundary: ErrorBoundary['resetErrorBoundary']
}

const Feilside = ({ error, resetErrorBoundary }: Props) => {
  return (
    <Content>
      <Avstand marginTop={4} marginBottom={4}>
        <Feilmelding
          feilmelding={{ feilmelding: 'Noe gikk galt og siden kan ikke vises', tekniskFeilmelding: error }}
        />
        <Avstand marginTop={4} />
        <Button onClick={resetErrorBoundary}>Prøv på nytt</Button>
      </Avstand>
    </Content>
  )
}

export default Feilside
