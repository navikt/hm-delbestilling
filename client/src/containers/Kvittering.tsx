import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import styled from 'styled-components'

import { PrinterSmallIcon } from '@navikt/aksel-icons'
import { Alert, BodyShort, Button, Heading, Label, Panel } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import BestillingsUtskrift from '../components/BestillingsUtskrift'
import { GlobalStyle } from '../GlobalStyle'
import { hentAntallDeler } from '../helpers/delHelper'
import Content from '../styledcomponents/Content'
import { Handlekurv, Levering } from '../types/Types'
import { logPrintKvitteringÅpnet, logStartNyBestilling } from '../utils/amplitude'
import { isProd } from '../utils/utils'

import { SESSIONSTORAGE_HANDLEKURV_KEY } from './Index'

type LocationState = {
  saksnummer: string
  handlekurv: Handlekurv
}

const SkjulForPrint = styled.div`
  @media print {
    display: none;
  }
`

const BestillingsInfo = styled.div`
  border-top: 1px solid var(--a-grayalpha-300);
  /* font-style: italic; */
  padding-top: 13px;
  > p {
    margin-bottom: 3px;
  }
`

const Kvittering = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [visBestillingsUtskrift, setVisBestillingsUtskrift] = useState(false)

  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforePrint: () => {
      setVisBestillingsUtskrift(true)
      logPrintKvitteringÅpnet()
    },
    onAfterPrint: () => setVisBestillingsUtskrift(false),
    documentTitle: `kvittering_delbestilling_${state?.saksnummer}`,
  })

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
      <div ref={printRef}>
        <Content>
          <Heading level="2" size="large" spacing>
            Kvittering
          </Heading>
          {handlekurv && (
            <Alert variant="success">
              <BodyShort spacing>
                {t('kvittering.bestillingMottatt', {
                  count: hentAntallDeler(handlekurv.deler),
                  navn: handlekurv.hjelpemiddel.navn,
                  hmsnr: handlekurv.hjelpemiddel.hmsnr,
                  serienr: handlekurv.serienr,
                })}
                :
              </BodyShort>

              {handlekurv.deler.map((delLinje, i) => (
                <Avstand marginBottom={4} key={i}>
                  <BodyShort>
                    <strong>{delLinje.del.navn}</strong>
                  </BodyShort>
                  <BodyShort>HMS-nr. {delLinje.del.hmsnr}</BodyShort>
                  <BodyShort>Antall: {delLinje.antall} stk</BodyShort>
                </Avstand>
              ))}

              <BestillingsInfo>
                <BodyShort>
                  <Label>Levering: </Label>
                  {handlekurv.levering === Levering.TIL_SERVICE_OPPDRAG &&
                    t('levering.serviceOppdrag', { count: hentAntallDeler(handlekurv.deler) })}
                  {handlekurv.levering === Levering.TIL_XK_LAGER &&
                    t('levering.xkLager', { count: hentAntallDeler(handlekurv.deler) })}
                </BodyShort>
                <BodyShort>
                  <Label>Bestillingsdato: </Label>
                  {new Date().toLocaleString('no', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </BodyShort>
                <BodyShort>
                  <Label>Saksnummer:</Label> {state.saksnummer}
                </BodyShort>
              </BestillingsInfo>
            </Alert>
          )}
          {!handlekurv && <Alert variant="warning">{t('kvittering.fantIkkeKvittering')}</Alert>}

          <SkjulForPrint>
            <Avstand marginTop={10} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <Button variant="secondary" onClick={handleNyBestillingClick}>
                {t('kvittering.startNyBestilling')}
              </Button>
              <Button variant="tertiary" onClick={handlePrint} icon={<PrinterSmallIcon />}>
                Skriv ut
              </Button>
            </div>
          </SkjulForPrint>
        </Content>
      </div>

      {visBestillingsUtskrift && <BestillingsUtskrift />}
    </main>
  )
}

export default Kvittering
