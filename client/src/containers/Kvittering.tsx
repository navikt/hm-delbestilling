import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { Alert, Button, Heading } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import { GlobalStyle } from '../GlobalStyle'
import Content from '../styledcomponents/Content'
import { DelLinje, Handlekurv } from '../types/Types'
import { logStartNyBestilling } from '../utils/amplitude'

import { SESSIONSTORAGE_HANDLEKURV_KEY } from './Index'

type LocationState = {
  handlekurv: Handlekurv
}

const Kvittering = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  useEffect(() => {
    window.sessionStorage.removeItem(SESSIONSTORAGE_HANDLEKURV_KEY)
    // Klarer window.history med staten med en gang, så vi unngår at den henger igjen på noe vis
    window.history.replaceState({}, document.title)

    setTimeout(() => {
      window.hj('event', 'digihot_delbestilling_sendt_inn_feedback')
    }, 200)
  }, [])

  const handleNyBestillingClick = () => {
    logStartNyBestilling()
    navigate('/')
    window.scrollTo(0, 0)
  }

  const handlekurv = state?.handlekurv

  const hentAntallDeler = (deler: DelLinje[]): number => {
    return deler.reduce((acc, curr) => {
      return acc + curr.antall
    }, 0)
  }

  if (!handlekurv) {
    return (
      <>
        <div>{t('kvittering.fantIkkeKvittering')}</div>
        <Button variant="secondary" onClick={handleNyBestillingClick}>
          {t('kvittering.startNyBestilling')}
        </Button>
      </>
    )
  }

  return (
    <main>
      <GlobalStyle mainBg="white" />
      <Content>
        <Heading level="2" size="large" spacing>
          Kvittering
        </Heading>
        <Alert variant="success">
          {t('kvittering.bestillingMottatt', {
            antall: hentAntallDeler(handlekurv.deler),
            navn: handlekurv.hjelpemiddel.navn,
            hmsnr: handlekurv.hjelpemiddel.hmsnr,
            serienr: handlekurv.serienr,
          })}
        </Alert>
        <Avstand marginTop={10} />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={handleNyBestillingClick}>
            {t('kvittering.startNyBestilling')}
          </Button>
        </div>
      </Content>
    </main>
  )
}

export default Kvittering
