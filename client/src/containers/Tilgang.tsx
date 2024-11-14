import React, { useEffect } from 'react'
import Tilgangoversikt from '../components/Tilgangoversikt'
import useAuth from '../hooks/useAuth'
import { Loader } from '@navikt/ds-react'

interface Props {}

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

  return <Tilgangoversikt />
}

export default Tilgang
