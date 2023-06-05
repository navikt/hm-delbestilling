import React, { useEffect } from 'react'
import Content from '../styledcomponents/Content'
import { Alert, Button, Heading } from '@navikt/ds-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bestilling } from '../types/Types'
import { Avstand } from '../components/Avstand'
import { LOCALSTORAGE_BESTILLING_KEY } from './Index'

type LocationState = {
  bestilling: Bestilling
}

const Kvittering = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  useEffect(() => {
    // Klarer window.history med staten med en gang, så vi unngår at den henger igjen på noe vis
    window.history.replaceState({}, document.title)
  }, [])

  const handleNyBestillingClick = () => {
    window.localStorage.removeItem(LOCALSTORAGE_BESTILLING_KEY)
    navigate('/')
    window.scrollTo(0, 0)
  }

  const bestilling = state?.bestilling

  if (!bestilling) {
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
    <main style={{ background: 'white' }}>
      <Content>
        <Heading level="2" size="large" spacing>
          Kvittering
        </Heading>
        <Alert variant="success">
          Vi har mottatt bestilling til av {bestilling.handlekurv.deler.length === 1 ? 'del' : 'deler'} til{' '}
          {bestilling.hjelpemiddel.navn} med art.nr: {bestilling.hjelpemiddel.hmsnr} og serienr:{' '}
          {bestilling.handlekurv.serienr}
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
