import React, { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { PencilIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, BodyShort, Button, Heading, HStack, Label, Link, LinkPanel, Panel } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import HjelpemiddelLookup from '../components/HjelpemiddelLookup'
import LeggTilDel from '../components/LeggTilDel'
import Lenke from '../components/Lenke'
import OmÅBestilleDeler from '../components/OmÅBestilleDeler'
import useAuth from '../hooks/useAuth'
import Content from '../styledcomponents/Content'
import { CustomPanel } from '../styledcomponents/CustomPanel'
import { Del, Handlekurv, Hjelpemiddel } from '../types/Types'

export const SESSIONSTORAGE_HANDLEKURV_KEY = 'hm-delbestilling-handlekurv'

const Index = () => {
  const [hmsnr, setHmsnr] = useState('')
  const [serienr, setSerienr] = useState('')
  const [hjelpemiddel, setHjelpemiddel] = useState<Hjelpemiddel | undefined>(undefined)
  const [erLoggetInn, setErLoggetInn] = useState(false)

  const { sjekkerLogin, sjekkLoginStatus } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    sjekkLoginStatus().then(setErLoggetInn)
  }, [])

  const handleBestill = async (hjelpemiddel: Hjelpemiddel, del: Del) => {
    const handlekurv: Handlekurv = {
      id: uuidv4(),
      serienr,
      hjelpemiddel,
      deler: [{ del, antall: del.defaultAntall }],
      levering: undefined,
      harOpplæringPåBatteri: undefined,
    }

    window.sessionStorage.setItem(SESSIONSTORAGE_HANDLEKURV_KEY, JSON.stringify(handlekurv))

    try {
      if (await sjekkLoginStatus()) {
        navigate('/utsjekk')
      } else {
        window.location.replace('/hjelpemidler/delbestilling/login')
      }
    } catch (e: any) {
      console.log(e)
      // TODO: vis feilmelding
      alert(t('error.klarteIkkeSjekkeLoginStatus'))
    }
  }

  return (
    <main>
      <Content>
        {!hjelpemiddel && (
          <>
            <Avstand marginBottom={10}>
              <Alert variant="info" style={{ marginBottom: '1rem' }}>
                <Heading level="2" size="small">
                  Teknisk vedlikehold i helgen
                </Heading>
                <Label>20. september kl 16:00 - 23. september kl. 07:00</Label>
                <BodyShort>
                  På grunn av planlagt vedlikeholdsarbeid vil det ikke være mulig å sende inn bestillinger på deler i
                  denne perioden.
                </BodyShort>
              </Alert>
            </Avstand>

            {/* <HjelpemiddelLookup
              hmsnr={hmsnr}
              setHmsnr={setHmsnr}
              serienr={serienr}
              setSerienr={setSerienr}
              setHjelpemiddel={setHjelpemiddel}
            /> */}

            <Avstand marginTop={10}>
              <LinkPanel
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (erLoggetInn) {
                    navigate('/bestillinger')
                  } else {
                    window.location.replace('/hjelpemidler/delbestilling/login?redirect=bestillinger')
                  }
                }}
              >
                <LinkPanel.Title>{t('bestillinger.dineSiste')}</LinkPanel.Title>
                {!sjekkerLogin && !erLoggetInn && (
                  <LinkPanel.Description>{t('bestillinger.loggInnForÅSeBestillinger')}</LinkPanel.Description>
                )}
              </LinkPanel>
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
                  <Trans
                    i18nKey={'info.omDigiHoT'}
                    components={{
                      linkDigihot: (
                        <Lenke
                          href="https://www.nav.no/samarbeidspartner/bruke-digitale-tjenester"
                          target={'_blank'}
                          lenketekst="Les mer om bruk av digitale løsninger på hjelpemiddelområdet"
                        />
                      ),
                      linkEmail: <Lenke href="mailto:digihot@nav.no" lenketekst="digihot@nav.no" />,
                    }}
                  />
                </BodyLong>
              </Panel>
            </Avstand>
          </>
        )}
        {hjelpemiddel && (
          <>
            <CustomPanel border>
              <HStack align="end" justify="space-between">
                <div>
                  <Heading size="xsmall" level="2" spacing>
                    {t('bestillinger.bestillingTil', { navn: hjelpemiddel.navn })}
                  </Heading>
                  <BodyShort style={{ display: 'flex', gap: '20px' }}>
                    <span>Art.nr. {hmsnr}</span>
                    <span>Serienr. {serienr}</span>
                  </BodyShort>
                </div>
                <Button
                  icon={<PencilIcon />}
                  variant="tertiary"
                  onClick={() => {
                    setHjelpemiddel(undefined)
                  }}
                >
                  {t('felles.Endre')}
                </Button>
              </HStack>
            </CustomPanel>
            <Avstand marginBottom={12} />
            <LeggTilDel
              hjelpemiddel={hjelpemiddel}
              onLeggTil={(del) => handleBestill(hjelpemiddel, del)}
              knappeTekst={t('bestillinger.bestill')}
            />
          </>
        )}
      </Content>
    </main>
  )
}

export default Index
