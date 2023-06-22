import React, { useEffect } from 'react'
import Content from '../styledcomponents/Content'
import { Alert, Button, Heading } from '@navikt/ds-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DelLinje, Handlekurv } from '../types/Types'
import { Avstand } from '../components/Avstand'
import { SESSIONSTORAGE_HANDLEKURV_KEY } from './Index'
import { GlobalStyle } from '../GlobalStyle'
import { logStartNyBestilling } from '../utils/amplitude'

type LocationState = {
  handlekurv: Handlekurv
}

const Kvittering = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  useEffect(() => {
    window.sessionStorage.removeItem(SESSIONSTORAGE_HANDLEKURV_KEY)
    // Klarer window.history med staten med en gang, så vi unngår at den henger igjen på noe vis
    window.history.replaceState({}, document.title)

    setTimeout(() => {
      window.hj('event', 'digihot_delbestilling_sendt_inn_feedback')
    }, 1)
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
        <div>Fant ingen kvittering</div>
        <Button variant="secondary" onClick={handleNyBestillingClick}>
          Start ny bestilling
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
          Vi har mottatt bestilling av {hentAntallDeler(handlekurv.deler) === 1 ? 'del' : 'deler'} til{' '}
          {handlekurv.hjelpemiddel.navn} med art.nr: {handlekurv.hjelpemiddel.hmsnr} og serienr: {handlekurv.serienr}.
        </Alert>
        <Avstand marginTop={10} />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={handleNyBestillingClick}>
            Start ny bestilling
          </Button>
        </div>
      </Content>
    </main>
  )
}

export default Kvittering
