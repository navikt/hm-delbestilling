import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'

interface Props {
  resetErrorBoundary: ErrorBoundary['resetErrorBoundary']
}

const Feilside = ({ resetErrorBoundary }: Props) => {
  return <div>Feilside</div>
}

export default Feilside
