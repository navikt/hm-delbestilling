import React from 'react'
import { Helmet } from 'react-helmet'
import { Outlet, Route, Routes as Switch } from 'react-router-dom'
import Index from './containers/Index'
import Utsjekk from './containers/Utsjekk'
import Kvittering from './containers/Kvittering'
import { RolleContextLayout } from './context/rolle'
import Header from './styledcomponents/Header'
import Content from './styledcomponents/Content'
import { Heading } from '@navikt/ds-react'
import Layout from './containers/Layout'

const Routes = () => {
  return (
    <>
      <Helmet htmlAttributes={{ lang: 'no' }}>
        <title>Delbestilling</title>
      </Helmet>
      <Switch>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          {/* Dette er routes som krever at innlogget bruker har en delbestillerrolle */}
          <Route element={<RolleContextLayout />}>
            <Route path="/utsjekk" element={<Utsjekk />} />
            <Route path="/kvittering" element={<Kvittering />} />
          </Route>
        </Route>
      </Switch>
    </>
  )
}

export default Routes
