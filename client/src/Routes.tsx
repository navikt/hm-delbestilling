import React from 'react'
import { Helmet } from 'react-helmet'
import { Route, Routes as Switch } from 'react-router-dom'
import Index from './containers/Index'
import Utsjekk from './containers/Utsjekk'

const Routes = () => {
  const erLoggetInn = true
  return (
    <>
      <Helmet htmlAttributes={{ lang: 'no' }}>
        <title>Delbestilling</title>
      </Helmet>
      <Switch>
        <Route path="/" element={<Index />} />
        {/* TODO: hvordan håndterer vi sjekk av login her? */}
        <Route path="/utsjekk" element={<Utsjekk />} />
      </Switch>
    </>
  )
}

export default Routes
