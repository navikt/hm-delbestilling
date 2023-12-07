import React, { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { PencilIcon, XMarkIcon } from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Button, Heading, HStack, Link, LinkPanel, Loader, Panel } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import HjelpemiddelLookup from '../components/HjelpemiddelLookup'
import LeggTilDel from '../components/LeggTilDel'
import Lenke from '../components/Lenke'
import OmÅBestilleDeler from '../components/OmÅBestilleDeler'
import useAuth from '../hooks/useAuth'
import rest from '../services/rest'
import { CenteredContent } from '../styledcomponents/CenteredContent'
import Content from '../styledcomponents/Content'
import { CustomPanel } from '../styledcomponents/CustomPanel'
import { Del, Handlekurv, Hjelpemiddel } from '../types/Types'

export const SESSIONSTORAGE_HANDLEKURV_KEY = 'hm-delbestilling-handlekurv'

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const hmsnrNrParam = searchParams.get('artnr')
  const [hmsnr, setHmsnr] = useState(hmsnrNrParam ?? '')
  const serienrParam = searchParams.get('serienr')
  const [serienr, setSerienr] = useState(serienrParam ?? '')

  const harArtnrOgSerienrParams = hmsnrNrParam && serienrParam

  const [hjelpemiddel, setHjelpemiddel] = useState<Hjelpemiddel | undefined>(undefined)
  const [erLoggetInn, setErLoggetInn] = useState(false)

  const { sjekkerLogin, sjekkLoginStatus } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    sjekkLoginStatus().then(setErLoggetInn)
  }, [])

  // Hvis artnr og serienr er satt med searchparams, gjør oppslag med en gang
  useEffect(() => {
    if (hmsnrNrParam && serienrParam) {
      ;(async () => {
        const oppslag = await rest.hjelpemiddelOppslag(hmsnrNrParam, serienrParam)
        if (oppslag.hjelpemiddel) {
          setHjelpemiddel(oppslag.hjelpemiddel)
        }
      })()
    }
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

  // TODO: fix oppslag på ikke-tilgjengelig hmsnr
  if (hmsnrNrParam && serienrParam && !hjelpemiddel) {
    return (
      <main>
        <Content>
          <Loader />
        </Content>
      </main>
    )
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
                          href="https://www.nav.no/no/nav-og-samfunn/samarbeid/hjelpemidler/digitalisering-av-hjelpemiddelomradet"
                          target={'_blank'}
                          lenketekst="DigiHoT – Digitalisering av hjelpemidler og tilrettelegging"
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
                {!harArtnrOgSerienrParams && (
                  <Button
                    icon={<PencilIcon />}
                    variant="tertiary"
                    onClick={() => {
                      setSearchParams(undefined)
                      setHjelpemiddel(undefined)
                    }}
                  >
                    {t('felles.Endre')}
                  </Button>
                )}
              </HStack>
            </CustomPanel>
            <Avstand marginBottom={12} />
            <LeggTilDel
              hjelpemiddel={hjelpemiddel}
              onLeggTil={(del) => handleBestill(hjelpemiddel, del)}
              knappeTekst={t('bestillinger.bestill')}
            />
            <Avstand marginTop={10}>
              <CenteredContent>
                <Button
                  variant="tertiary"
                  icon={<XMarkIcon />}
                  onClick={() => {
                    // Antar at bruker har kommet fra dinehjelpemidler
                    if (harArtnrOgSerienrParams) {
                      window.location.href = window.appSettings.DINEHJELPEMIDLER_URL
                    } else {
                      setHjelpemiddel(undefined)
                      setSearchParams(undefined)
                      setHmsnr('')
                      setSerienr('')
                      window.scrollTo(0, 0)
                    }
                  }}
                >
                  Avbryt bestilling
                </Button>
              </CenteredContent>
            </Avstand>
          </>
        )}
      </Content>
    </main>
  )
}

export default Index
