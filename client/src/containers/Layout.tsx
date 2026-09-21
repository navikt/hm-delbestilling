import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'

import { Box, GlobalAlert, Heading, InfoCard } from '@navikt/ds-react'

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
      {visTestMiljoBanner && (
        <GlobalAlert status="announcement">
          <GlobalAlert.Header>
            <GlobalAlert.Title>{t('testbanner.tittel')}</GlobalAlert.Title>
          </GlobalAlert.Header>
          <GlobalAlert.Content>{t('testbanner.innhold')}</GlobalAlert.Content>
        </GlobalAlert>
      )}
      <Header>
        <Content>
          <Heading level="1" size="xlarge">
            {t('felles.overskrift')}
          </Heading>

          <Avstand marginTop={16}>
            <InfoCard data-color="info">
              <InfoCard.Header>
                <InfoCard.Title>{t('nyhet.tittel')}</InfoCard.Title>
              </InfoCard.Header>
              <InfoCard.Content>{t('nyhet.innhold')}</InfoCard.Content>
            </InfoCard>
          </Avstand>
        </Content>
      </Header>
      <Box background="default" paddingBlock="space-0 space-20">
          <Outlet />
      </Box>
    </>
  )
}

export default Layout
