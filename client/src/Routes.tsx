import { Helmet } from 'react-helmet'
import { Trans, useTranslation } from 'react-i18next'
import { Route, Routes as Switch } from 'react-router-dom'

import { BodyShort, Box, Link } from '@navikt/ds-react'

import Bestillinger from './containers/Bestillinger'
import Index from './containers/Index'
import Kvittering from './containers/Kvittering'
import Layout from './containers/Layout'
import Utsjekk from './containers/Utsjekk'
import { RolleContextLayout } from './context/rolle'
import Content from './styledcomponents/Content'

const Routes = () => {
  return (
    <>
      <Helmet htmlAttributes={{ lang: 'no' }}>
        <title>Delbestilling</title>
      </Helmet>
      <Switch>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          {/* TODO: slett meg etter 01.05.25 */}
          <Route path="/oversikt" element={<BrukFinnhjelpemiddel />} />
          {/* TODO: slett meg etter 01.05.25 */}
          <Route path="/delliste" element={<BrukFinnhjelpemiddel />} />
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

const BrukFinnhjelpemiddel = () => {
  const { t } = useTranslation()
  return (
    <Content>
      <Box padding="6">
        <BodyShort>
          <Trans
            i18nKey="brukFinnHjelpemiddel"
            components={{
              //@ts-ignore
              finnHjelpemiddelLink: <Link href="https://finnhjelpemiddel.nav.no/" target="_blank" />,
            }}
          />
        </BodyShort>
      </Box>
    </Content>
  )
}

export default Routes
