import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { Alert, BodyShort, Button, Heading, HStack } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import BestillingsKort from '../components/BestillingsKort'
import { useRolleContext } from '../context/rolle'
import { GlobalStyle } from '../GlobalStyle'
import Content from '../styledcomponents/Content'
import { DelbestillingSak } from '../types/Types'
import { logStartNyBestilling } from '../utils/amplitude'
import { isProd } from '../utils/utils'

import { SESSIONSTORAGE_HANDLEKURV_KEY } from './Index'

type LocationState = {
  delbestillingSak: DelbestillingSak
}

const Kvittering = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const { delbestillerrolle } = useRolleContext()

  useEffect(() => {
    if (isProd()) {
      window.sessionStorage.removeItem(SESSIONSTORAGE_HANDLEKURV_KEY)
      // Klarer window.history med staten med en gang, så vi unngår at den henger igjen på noe vis
      window.history.replaceState({}, document.title)

      setTimeout(() => {
        window.hj('event', 'digihot_delbestilling_sendt_inn_feedback')
      }, 200)
    }
  }, [])

  const handleNyBestillingClick = () => {
    logStartNyBestilling()
    navigate('/')
    window.scrollTo(0, 0)
  }

  const delbestillingSak = state?.delbestillingSak

  return (
    <main>
      <GlobalStyle mainBg="white" />
      <Content>
        {delbestillingSak && (
          <>
            <Alert variant="success">{t('kvittering.bestillingMottatt')}</Alert>
            <Avstand marginTop={8} />
            <Heading level="2" size="large" spacing>
              Kvittering
            </Heading>
            <BestillingsKort sak={delbestillingSak} />
          </>
        )}
        {!delbestillingSak && <Alert variant="warning">{t('kvittering.fantIkkeKvittering')}</Alert>}

        <Avstand marginTop={8} />

        {delbestillerrolle.erTekniker && (
          <>
            <BodyShort>
              Du kan se bestillinger du har sendt inn på{' '}
              <a href="/hjelpemidler/delbestilling/bestillinger">Dine innsendte bestillinger.</a>
            </BodyShort>
            <Avstand marginBottom={14} />
            <HStack justify="center">
              <Button variant="secondary" onClick={handleNyBestillingClick}>
                {t('kvittering.startNyBestilling')}
              </Button>
            </HStack>
          </>
        )}

        {delbestillerrolle.erBrukerpassbruker && (
          <BodyShort>
            Du kan se bestillinger du har sendt inn på Ditt NAV på{' '}
            <a href={window.appSettings.DINEHJELPEMIDLER_URL}>Hjelpemidler.</a>
          </BodyShort>
        )}
      </Content>
    </main>
  )
}

export default Kvittering
