import React from 'react'
import { Helmet } from 'react-helmet'
import { Route, Routes as Switch } from 'react-router-dom'
import Index from './containers/Index'

const Routes = () => {
  const erLoggetInn = true
  return (
    <>
      <Helmet htmlAttributes={{ lang: 'no' }}>
        <title>Delbestilling</title>
      </Helmet>
      <Switch>
        <Route path="/" element={<Index />} />
        {erLoggetInn && <Route path="/checkout" element={<div>Checkout kommer her...</div>} />}
      </Switch>
    </>
  )
}

export default Routes
