import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { Alert, Button, Heading, HStack } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import BestillingsKort from '../components/BestillingsKort'
import Content from '../components/Layout/Content'
import { DelbestillingSak } from '../types/Types'
import { logStartNyBestilling } from '../utils/amplitude'
import { triggerHotjarEvent } from '../utils/hotjar'
import { isConsentingToSurveys } from '../utils/nav-cookie-consent'
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

  useEffect(() => {
    if (isProd()) {
      window.sessionStorage.removeItem(SESSIONSTORAGE_HANDLEKURV_KEY)
      // Klarer window.history med staten med en gang, så vi unngår at den henger igjen på noe vis
      window.history.replaceState({}, document.title)

      if (isConsentingToSurveys()) {
        setTimeout(() => {
          triggerHotjarEvent('digihot_delbestilling_sendt_inn_feedback')
        }, 200)
      }
    }
  }, [])

  const handleNyBestillingClick = () => {
    logStartNyBestilling()
    navigate('/')
  }

  const delbestillingSak = state?.delbestillingSak

  return (
    <main style={{ '--main-bg-color': 'white' } as React.CSSProperties}>
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

        <Avstand marginTop={10} />
        <HStack justify="center">
          <Button variant="secondary" onClick={handleNyBestillingClick}>
            {t('kvittering.startNyBestilling')}
          </Button>
        </HStack>
      </Content>
    </main>
  )
}

export default Kvittering
