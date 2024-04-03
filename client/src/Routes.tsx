import React from 'react'
import { Helmet } from 'react-helmet'
import { Route, Routes as Switch } from 'react-router-dom'

import Bestillinger from './containers/Bestillinger'
import Index from './containers/Index'
import Kvittering from './containers/Kvittering'
import Layout from './containers/Layout'
import Oversikt from './containers/Oversikt'
import Utsjekk from './containers/Utsjekk'
import { RolleContextLayout } from './context/rolle'
import Delliste from './containers/Delliste'

const Routes = () => {
  return (
    <>
      <Helmet htmlAttributes={{ lang: 'no' }}>
        <title>Delbestilling</title>
      </Helmet>
      <Switch>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/oversikt" element={<Oversikt />} />
          <Route path="/delliste" element={<Delliste />} />
          {/* Dette er routes som krever at innlogget bruker har en delbestillerrolle */}
          <Route element={<RolleContextLayout />}>
            <Route path="/utsjekk" element={<Utsjekk />} />
            <Route path="/kvittering" element={<Kvittering />} />
            <Route path="/bestillinger" element={<Bestillinger />} />
          </Route>
        </Route>
      </Switch>
    </>
  )
}

export default Routes
