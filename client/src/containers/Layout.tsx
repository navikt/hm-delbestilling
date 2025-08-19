import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'

import { Alert, Heading } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import Content from '../components/ui/Content'
import Header from '../components/ui/Header'

// Delte page-komponenter for hver side
const Layout = () => {
  const { t } = useTranslation()
  const visTestMiljoBanner = window.appSettings.USE_MSW === true
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
      <Outlet />
    </>
  )
}

export default Layout
