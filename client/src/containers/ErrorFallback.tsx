import React, { VFC } from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { ApiError } from '../types/errors'
import Unauthorized from './Unauthorized'
import Feilside from './Feilside'

export const ErrorFallback: VFC<FallbackProps> = (props) => {
  const { error, resetErrorBoundary } = props

  if (error instanceof ApiError && error.isUnauthorized()) {
    return <Unauthorized resetErrorBoundary={resetErrorBoundary} />
  }
  return <Feilside resetErrorBoundary={resetErrorBoundary} />
}
