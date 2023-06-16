import React from 'react'
import Header from '../styledcomponents/Header'
import Content from '../styledcomponents/Content'
import { Alert, Heading } from '@navikt/ds-react'
import { Outlet } from 'react-router-dom'
import { Avstand } from '../components/Avstand'

// Delte page-komponenter for hver side
const Layout = () => {
  const visTestMiljoBanner = window.appSettings.USE_MSW === true && window.location.hostname !== 'localhost'
  return (
    <>
      <Header>
        <Content>
          {visTestMiljoBanner && (
            <Avstand marginTop={4} marginBottom={8}>
              <Alert variant="info">
                Du ser nå på en testversjon av løsningen, hvor informasjonen kun er testdata og ikke gjenspeiler
                virkeligheten.
              </Alert>
            </Avstand>
          )}
          <Heading level="1" size="xlarge">
            Bestill del til hjelpemiddel
          </Heading>
        </Content>
      </Header>
      <Outlet />
    </>
  )
}

export default Layout
