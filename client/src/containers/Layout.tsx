import React from 'react'
import Header from '../styledcomponents/Header'
import Content from '../styledcomponents/Content'
import { Heading } from '@navikt/ds-react'
import { Outlet } from 'react-router-dom'

// Delte page-komponenter for hver side
const Layout = () => {
  return (
    <>
      <Header>
        <Content>
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
