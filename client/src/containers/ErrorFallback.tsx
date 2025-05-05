import type { FallbackProps } from 'react-error-boundary'

import Feilside from './Feilside'

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return <Feilside error={error} resetErrorBoundary={resetErrorBoundary} />
}
