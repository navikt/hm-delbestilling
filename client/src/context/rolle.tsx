import React, { useContext, useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth'
import { DelbestillerResponse } from '../types/HttpTypes'
import { Loader } from '@navikt/ds-react'
import { Outlet } from 'react-router-dom'
import { Avstand } from '../components/Avstand'

type RolleContextType = {
  delbestillerRolle: DelbestillerResponse
}

const RolleContext = React.createContext<RolleContextType>({ delbestillerRolle: undefined! }) // fortell TS med ! at denne propertien har en verdi på runtime

export const RolleProvider = ({ children }: { children: React.ReactNode }) => {
  const [henterRolle, setHenterRolle] = useState(true)
  const [delbestillerRolle, setDelbestillerRolle] = useState<DelbestillerResponse | undefined>()

  const { rolle } = useAuth()

  useEffect(() => {
    ;(async () => {
      try {
        const delbestiller = await rolle()
        setDelbestillerRolle(delbestiller)
      } catch (err) {
        alert('Kunne ikke sjekke rolle, se konsoll for detaljer')
        console.log(err)
      } finally {
        setHenterRolle(false)
      }
    })()
  }, [])

  if (henterRolle) {
    return (
      <Avstand paddingTop={16} paddingBottom={16}>
        <div style={{ textAlign: 'center' }}>
          <Loader size="large" />
        </div>
      </Avstand>
    )
  }

  if (!delbestillerRolle) {
    return <div>Fant ingen delbestillerrolle</div>
  }

  if (delbestillerRolle.erKommunaltAnsatt === false) {
    return <div>Du er ikke kommunalt ansatt, og kan derfor ikke bestille deler</div>
  }

  if (delbestillerRolle.kanBestilleDeler === false) {
    // TODO: kanskje noe info om pilot?
    return <div>Du kan ikke bestille deler akkurat nå (du er ikke i pilot)</div>
  }

  return <RolleContext.Provider value={{ delbestillerRolle }}>{children}</RolleContext.Provider>
}

// Lar oss gruppere flere routes inni en og samme provider
export const RolleContextLayout = () => {
  return (
    <RolleProvider>
      <Outlet />
    </RolleProvider>
  )
}

export const useRolleContext = () => {
  const context = useContext(RolleContext)
  if (context === undefined) {
    throw new Error('useRolleContext må ligge inni RolleProvider')
  }

  return context
}
