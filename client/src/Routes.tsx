import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Route, Routes as Switch } from 'react-router-dom'
import Index from './containers/Index'
import Utsjekk from './containers/Utsjekk'

const Routes = () => {
  return (
    <>
      <Helmet htmlAttributes={{ lang: 'no' }}>
        <title>Delbestilling</title>
      </Helmet>
      <Switch>
        <Route path="/" element={<Index />} />
        <Route path="/utsjekk" element={<Utsjekk />} />
      </Switch>
    </>
  )
}

export default Routes
