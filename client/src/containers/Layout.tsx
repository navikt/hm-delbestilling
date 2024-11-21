import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'

import { Alert, Heading, Link } from '@navikt/ds-react'

import { BASE_PATH } from '../App'
import { Avstand } from '../components/Avstand'
import useAuth from '../hooks/useAuth'
import Content from '../styledcomponents/Content'
import Header from '../styledcomponents/Header'
import { Delbestillerrolle } from '../types/Types'

// Delte page-komponenter for hver side
const Layout = () => {
  const { t } = useTranslation()
  const visTestMiljoBanner = window.appSettings.USE_MSW === true && window.location.hostname !== 'localhost'

  return (
    <>
      <Header>
        <Content>
          {visTestMiljoBanner && (
            <Avstand marginTop={4} marginBottom={8}>
              <Alert variant="info">{t('testbanner')}</Alert>
            </Avstand>
          )}
          <Heading level="1" size="xlarge">
            {t('felles.overskrift')}
          </Heading>
        </Content>
      </Header>
      <RettighetPåminnelse />
      <Outlet />
    </>
  )
}

const RettighetPåminnelse = () => {
  const { rolle } = useAuth()
  const [delbestillerrolle, setDelbestillerrolle] = useState<Delbestillerrolle | undefined>()

  useEffect(() => {
    ;(async () => {
      try {
        const response = await rolle()
        setDelbestillerrolle(response.delbestillerrolle)
      } catch (err: any) {
        console.log(err)
      }
    })()
  }, [])

  if (!delbestillerrolle) {
    return null
  }

  let advarselTekst: React.ReactNode

  if (!delbestillerrolle.delbestillerrettighet.harRettighet) {
    advarselTekst = (
      <>
        Det kan se ut som du ikke har fått den nye rettigheten for å bestille deler. Du kan fortsette bestille deler,
        men om x antall uker må du ha bedt om den nye rettigheten. Trykk <Link href={`${BASE_PATH}tilgang`}>her</Link>{' '}
        for å gjøre det.
      </>
    )
  }

  if (advarselTekst) {
    return <Alert variant="warning">{advarselTekst}</Alert>
  }

  return null
}

export default Layout
