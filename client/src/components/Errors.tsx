import { ErrorSummary } from '@navikt/ds-react'
import React, { useEffect } from 'react'
import { Valideringsfeil } from '../containers/Utsjekk'

interface Props {
  valideringsFeil: Valideringsfeil[]
}

const Errors = ({ valideringsFeil }: Props) => {
  const summaryRef = React.useRef<HTMLDivElement>(null)

  const handleFocus = () => summaryRef.current?.focus()

  useEffect(() => {
    handleFocus()
  }, [])

  return (
    <ErrorSummary ref={summaryRef} heading="Du må rette opp følgende">
      {valideringsFeil.map((feil) => (
        <ErrorSummary.Item href={`#${feil.id}`} key={feil.id}>
          {feil.melding}
        </ErrorSummary.Item>
      ))}
    </ErrorSummary>
  )
}

export default Errors
