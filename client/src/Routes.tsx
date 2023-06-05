import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Route, Routes as Switch } from 'react-router-dom'
import Index from './containers/Index'
import Utsjekk from './containers/Utsjekk'
import Kvittering from './containers/Kvittering'

const Routes = () => {
  return (
    <>
      <Helmet htmlAttributes={{ lang: 'no' }}>
        <title>Delbestilling</title>
      </Helmet>
      <Switch>
        <Route path="/" element={<Index />} />
        {/* TODO: kanskje wrappe disse i en protected route? */}
        <Route path="/utsjekk" element={<Utsjekk />} />
        <Route path="/kvittering" element={<Kvittering />} />
      </Switch>
    </>
  )
}

export default Routes
