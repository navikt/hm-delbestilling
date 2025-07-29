import { Helmet } from 'react-helmet'
import { Route, Routes as Switch } from 'react-router-dom'

import Bestillinger from './containers/Bestillinger'
import Index from './containers/Index'
import Kvittering from './containers/Kvittering'
import Layout from './containers/Layout'
import Utsjekk from './containers/Utsjekk'
import { RolleContextLayout } from './context/rolle'
import { umamiWebsiteId } from './utils/analytics'

const Routes = () => {
  return (
    <>
      <Helmet htmlAttributes={{ lang: 'no' }}>
        <title>Delbestilling</title>
        <script
          defer
          src="https://cdn.nav.no/team-researchops/sporing/sporing.js"
          data-host-url="https://umami.nav.no"
          data-website-id={umamiWebsiteId}
        ></script>
      </Helmet>
      <Switch>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          {/* Routes som krever at innlogget bruker har delbestillerrolle */}
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
