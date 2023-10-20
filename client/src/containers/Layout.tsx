import React from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'

import { Alert, Heading } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import Content from '../styledcomponents/Content'
import Header from '../styledcomponents/Header'

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
          <Avstand marginBottom={6}>
            <Alert variant="warning" style={{ textAlign: 'left' }}>
              <Heading size="small" level="2">
                Teknisk vedlikehold
              </Heading>
              Grunnet teknisk vedlikehold vil det ikke mulig å sende inn delbestillinger i perioden kl 1800 fredag 20.
              oktober, til og med søndag 22. oktober.
            </Alert>
          </Avstand>
          <Heading level="1" size="xlarge">
            {t('felles.overskrift')}
          </Heading>
        </Content>
      </Header>
      <Outlet />
    </>
  )
}

export default Layout
