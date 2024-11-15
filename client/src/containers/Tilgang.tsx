import React, { useEffect } from 'react'

import { Loader } from '@navikt/ds-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Tilgangoversikt from '../components/Tilgangoversikt'
import useAuth from '../hooks/useAuth'

interface Props {}
const queryClient = new QueryClient()

const Tilgang = ({}: Props) => {
  const { sjekkLoginStatus, sjekkerLogin } = useAuth()

  useEffect(() => {
    ;(async () => {
      const erLoggetInn = await sjekkLoginStatus()
      if (!erLoggetInn) {
        window.location.replace('/hjelpemidler/delbestilling/login')
      }
    })()
  }, [])

  if (sjekkerLogin) {
    return <Loader />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Tilgangoversikt />
    </QueryClientProvider>
  )
}

export default Tilgang
