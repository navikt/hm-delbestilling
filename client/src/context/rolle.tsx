import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth'
import { Delbestillerrolle } from '../types/Types'
import { GuidePanel, Loader } from '@navikt/ds-react'
import { Outlet } from 'react-router-dom'
import { Avstand } from '../components/Avstand'
import Content from '../styledcomponents/Content'
import { useErrorBoundary } from 'react-error-boundary'

type RolleContextType = {
  delbestillerrolle: Delbestillerrolle
  setDelbestillerrolle: Dispatch<SetStateAction<Delbestillerrolle | undefined>>
}

const RolleContext = React.createContext<RolleContextType>({
  // fortell TS med ! at disse har en verdi på runtime
  delbestillerrolle: undefined!,
  setDelbestillerrolle: undefined!,
})

export const RolleProvider = ({ children }: { children: React.ReactNode }) => {
  const [henterRolle, setHenterRolle] = useState(true)
  const [delbestillerrolle, setDelbestillerrolle] = useState<Delbestillerrolle | undefined>()
  const { showBoundary } = useErrorBoundary()

  const { rolle } = useAuth()

  useEffect(() => {
    ;(async () => {
      try {
        const response = await rolle()
        setDelbestillerrolle(response.delbestillerrolle)
      } catch (err: any) {
        console.log(err)
        showBoundary(`Kunne ikke hente rolle: ${err.message}`)
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

  let feilmeldingsTekst = ''

  if (!delbestillerrolle) {
    return <div>Ingen delbestillerrolle</div>
  } else if (delbestillerrolle.erKommunaltAnsatt === false) {
    feilmeldingsTekst = 'Du er ikke kommunalt ansatt, og kan derfor ikke bestille deler.'
  } else if (delbestillerrolle.erIPilot === false) {
    feilmeldingsTekst = 'Du kan ikke bestille deler akkurat nå (du er ikke i pilot).'
  } else if (delbestillerrolle.kanBestilleDeler === false) {
    feilmeldingsTekst = 'Du kan ikke bestille deler.'
  }

  if (feilmeldingsTekst) {
    return (
      <Content>
        <Avstand marginTop={10} marginBottom={10}>
          <GuidePanel>{feilmeldingsTekst}</GuidePanel>
        </Avstand>
      </Content>
    )
  }

  return <RolleContext.Provider value={{ delbestillerrolle, setDelbestillerrolle }}>{children}</RolleContext.Provider>
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
