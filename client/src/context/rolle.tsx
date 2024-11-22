import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'

import { GuidePanel, HStack, Loader } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import { useRolle } from '../hooks/useRolle'
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
  const [delbestillerrolle, setDelbestillerrolle] = useState<Delbestillerrolle | undefined>()
  const { showBoundary } = useErrorBoundary()

  const { data: delbestillerData, isFetching: henterRolle, error } = useRolle()

  useEffect(() => {
    if (delbestillerData?.delbestillerrolle) {
      setDelbestillerrolle(delbestillerData.delbestillerrolle)
    }
  }, [delbestillerData])

  if (henterRolle) {
    return (
      <Avstand paddingTop={16} paddingBottom={16}>
        <HStack justify="center">
          <Loader size="large" />
        </HStack>
      </Avstand>
    )
  }

  if (error) {
    showBoundary(`Kunne ikke hente rolle: ${error}`)
  }

  let feilmeldingsTekst = ''

  if (!delbestillerrolle) {
    return <div>{t('error.ingenRolle')}</div>
  } else {
    if (!delbestillerrolle.delbestillerrettighet.harRettighet) {
      if (delbestillerrolle.erKommunaltAnsatt === false) {
        feilmeldingsTekst = t('error.ikkeKommunaltAnsatt')
      } else if (delbestillerrolle.kanBestilleDeler === false) {
        feilmeldingsTekst = t('error.kanIkkeBestilleDeler')
      }
    }
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
