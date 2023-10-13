import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { PrinterSmallIcon } from '@navikt/aksel-icons'
import { Alert, Button, Heading, HStack } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import BestillingsOppsummering from '../components/BestillingsOppsummering'
import { GlobalStyle } from '../GlobalStyle'
import Content from '../styledcomponents/Content'
import { Handlekurv } from '../types/Types'
import { logStartNyBestilling } from '../utils/amplitude'
import { isProd } from '../utils/utils'

import { SESSIONSTORAGE_HANDLEKURV_KEY } from './Index'

type LocationState = {
  saksnummer: string
  handlekurv: Handlekurv
}

const Kvittering = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [printErAktiv, setPrintErAktiv] = useState(false)

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

  const handlekurv = state?.handlekurv

  return (
    <main>
      <GlobalStyle mainBg="white" />

      <Content>
        {handlekurv && (
          <>
            <Alert variant="success">Bestillingen ble sendt inn.</Alert>
            <Avstand marginBottom={6} />
            <Heading level="2" size="large" spacing>
              Kvittering
            </Heading>
            <BestillingsOppsummering
              printErAktiv={printErAktiv}
              hjelpemiddel={{
                hmsnr: handlekurv.hjelpemiddel.hmsnr,
                navn: handlekurv.hjelpemiddel.navn,
                serienr: handlekurv.serienr,
              }}
              deler={handlekurv.deler}
              levering={handlekurv.levering}
              opprettet={new Date()}
              saksnummer={state.saksnummer}
              onClose={() => setPrintErAktiv(false)}
            />
          </>
        )}
        {!handlekurv && <Alert variant="warning">{t('kvittering.fantIkkeKvittering')}</Alert>}

        <Avstand marginTop={10} />
        <HStack justify="center">
          <Button variant="secondary" onClick={handleNyBestillingClick}>
            {t('kvittering.startNyBestilling')}
          </Button>
          <Button variant="tertiary" onClick={() => setPrintErAktiv(true)} icon={<PrinterSmallIcon />}>
            Skriv ut
          </Button>
        </HStack>
      </Content>
    </main>
  )
}

export default Kvittering
