import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'

import { GuidePanel, HStack, Loader } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import useAuth from '../hooks/useAuth'
import Content from '../styledcomponents/Content'
import { Delbestillerrolle } from '../types/Types'

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
  const { t } = useTranslation()
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
        <HStack justify="center">
          <Loader size="large" />
        </HStack>
      </Avstand>
    )
  }

  let feilmeldingsTekst = ''

  if (!delbestillerrolle) {
    return <div>{t('error.ingenRolle')}</div>
  } else if (delbestillerrolle.kanBestilleDeler === false) {
    // feilmeldingsTekst = 'error.kanIkkeBestilleDeler'
    // TODO: greit at vi viser generell tekst her?
    feilmeldingsTekst =
      'Du kan ikke bestiller deler, da du ikke er kommunalt ansatt eller jobber i en godkjent organisasjon.'
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
