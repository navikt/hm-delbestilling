import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'

import { Box, GlobalAlert, Heading } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import Content from '../components/Layout/Content'
import Header from '../components/Layout/Header'
import Toolbar from '../components/Toolbar/Toolbar'

// Delte page-komponenter for hver side
const Layout = () => {
  const { t } = useTranslation()
  const visTestMiljoBanner = window.appSettings.USE_MSW === true
  return (
    <>
      <Toolbar />
      <Header>
        <Content>
          {visTestMiljoBanner && (
            <Avstand marginTop={4} marginBottom={8}>
              <GlobalAlert status="announcement">
                <GlobalAlert.Header>
                  <GlobalAlert.Title>{t('testbanner.tittel')}</GlobalAlert.Title>
                </GlobalAlert.Header>
                <GlobalAlert.Content>{t('testbanner.innhold')}</GlobalAlert.Content>
              </GlobalAlert>
            </Avstand>
          )}
          <Heading level="1" size="xlarge">
            {t('felles.overskrift')}
          </Heading>
        </Content>
      </Header>
      <Box background="sunken" paddingBlock="space-8">
        <Outlet />
      </Box>
    </>
  )
}

export default Layout
