import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { PencilIcon } from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Button, Heading, Link, LinkPanel, Panel } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import HjelpemiddelLookup from '../components/HjelpemiddelLookup'
import LeggTilDel from '../components/LeggTilDel'
import OmÅBestilleDeler from '../components/OmÅBestilleDeler'
import { defaultAntall } from '../helpers/delHelper'
import useAuth from '../hooks/useAuth'
import { CenteredContent } from '../styledcomponents/CenteredContent'
import Content from '../styledcomponents/Content'
import { CustomPanel } from '../styledcomponents/CustomPanel'
import { Del, Handlekurv, Hjelpemiddel } from '../types/Types'

export const SESSIONSTORAGE_HANDLEKURV_KEY = 'hm-delbestilling-handlekurv'

const Index = () => {
  const [hmsnr, setHmsnr] = useState('')
  const [serienr, setSerienr] = useState('')
  const [hjelpemiddel, setHjelpemiddel] = useState<Hjelpemiddel | undefined>(undefined)
  const [erLoggetInn, setErLoggetInn] = useState(false)

  const { loginStatus } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    loginStatus().then(setErLoggetInn)
  }, [])

  const handleBestill = async (hjelpemiddel: Hjelpemiddel, del: Del) => {
    const handlekurv: Handlekurv = {
      id: uuidv4(),
      serienr,
      hjelpemiddel,
      deler: [{ del, antall: defaultAntall(del) }],
      levering: undefined,
      harOpplæringPåBatteri: undefined,
    }

    window.sessionStorage.setItem(SESSIONSTORAGE_HANDLEKURV_KEY, JSON.stringify(handlekurv))

    try {
      const erLoggetInn = await loginStatus()
      if (erLoggetInn) {
        navigate('/utsjekk')
      } else {
        window.location.replace('/hjelpemidler/delbestilling/login')
      }
    } catch (e: any) {
      console.log(e)
      // TODO: vis feilmelding
      alert('Vi klarte ikke å sjekke loginstatus akkurat nå. Prøv igjen senere.')
    }
  }

  return (
    <main>
      <Content>
        {!hjelpemiddel && (
          <>
            <HjelpemiddelLookup
              hmsnr={hmsnr}
              setHmsnr={setHmsnr}
              serienr={serienr}
              setSerienr={setSerienr}
              setHjelpemiddel={setHjelpemiddel}
            />

            <Avstand marginTop={10}>
              {erLoggetInn ? (
                <LinkPanel
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/bestillinger')
                  }}
                >
                  <LinkPanel.Title>{t('bestillinger.dineSiste')}</LinkPanel.Title>
                </LinkPanel>
              ) : (
                <CenteredContent>
                  <Button
                    onClick={() => window.location.replace('/hjelpemidler/delbestilling/login?redirect=bestillinger')}
                    variant="secondary"
                  >
                    Logg inn for å se bestillinger
                  </Button>
                </CenteredContent>
              )}
            </Avstand>

            <Avstand marginTop={10}>
              <OmÅBestilleDeler />
            </Avstand>

            <Avstand marginTop={10}>
              <Panel>
                <Heading level="2" size="medium" spacing>
                  Kontakt oss
                </Heading>
                <BodyLong>
                  Tjenesten utvikles av{' '}
                  <Link href="DigiHoT – Digitalisering av hjelpemidler og tilrettelegging">
                    DigiHoT – Digitalisering av hjelpemidler og tilrettelegging
                  </Link>
                  . Du kan sende oss spørsmål eller tilbakemeldinger om den digitale tjenesten på{' '}
                  <Link href="mailto:digihot@nav.no">digihot@nav.no</Link>. Ikke send opplysninger om brukerne, vi kan
                  ikke se sakene dine. Hvis du har spørsmål om saksbehandling og levering, så må du ta kontakt med din
                  hjelpemiddelsentral.
                </BodyLong>
              </Panel>
            </Avstand>
          </>
        )}
        {hjelpemiddel && (
          <>
            <CustomPanel border>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <Heading size="xsmall" level="4" spacing>
                  Bestilling til {hjelpemiddel.navn}
                </Heading>
                <Button
                  icon={<PencilIcon />}
                  variant="tertiary"
                  onClick={() => {
                    setHjelpemiddel(undefined)
                  }}
                >
                  Endre
                </Button>
              </div>
              <BodyShort style={{ display: 'flex', gap: '20px' }}>
                <span>Art.nr. {hmsnr}</span>
                <span>Serienr. {serienr}</span>
              </BodyShort>
            </CustomPanel>
            <Avstand marginBottom={12} />
            <LeggTilDel
              hjelpemiddel={hjelpemiddel}
              onLeggTil={(del) => handleBestill(hjelpemiddel, del)}
              knappeTekst="Bestill"
            />
          </>
        )}
      </Content>
    </main>
  )
}

export default Index
