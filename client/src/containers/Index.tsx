import React, { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { PencilIcon } from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Button, Heading, HStack, LinkPanel, Panel } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import { BestilteDeler } from '../components/BestilteDeler'
import HjelpemiddelLookup from '../components/HjelpemiddelLookup'
import LeggTilDel from '../components/LeggTilDel'
import Lenke from '../components/Lenke'
import OmÅBestilleDeler from '../components/OmÅBestilleDeler'
import Rolleswitcher from '../components/Rolleswitcher'
import useAuth from '../hooks/useAuth'
import Content from '../styledcomponents/Content'
import { CustomPanel } from '../styledcomponents/CustomPanel'
import { Pilot } from '../types/HttpTypes'
import { Del, Handlekurv, Hjelpemiddel } from '../types/Types'

export const SESSIONSTORAGE_HANDLEKURV_KEY = 'hm-delbestilling-handlekurv'

const Index = () => {
  const [hmsnr, setHmsnr] = useState('')
  const [serienr, setSerienr] = useState('')
  const [hjelpemiddel, setHjelpemiddel] = useState<Hjelpemiddel | undefined>(undefined)
  const [piloter, setPiloter] = useState<Pilot[]>([])
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
      piloter,
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
            <HjelpemiddelLookup
              hmsnr={hmsnr}
              setHmsnr={setHmsnr}
              serienr={serienr}
              setSerienr={setSerienr}
              onOppslagSuksess={(hjelpemiddel, piloter) => {
                setHjelpemiddel(hjelpemiddel)
                setPiloter(piloter)
              }}
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
            <Avstand marginTop={6} marginBottom={12}>
              <BestilteDeler hjelpemiddel={hjelpemiddel} serienr={serienr} />
            </Avstand>

            <LeggTilDel
              hjelpemiddel={hjelpemiddel}
              onLeggTil={(del) => handleBestill(hjelpemiddel, del)}
              knappeTekst={t('bestillinger.bestill')}
              piloter={piloter}
            />
          </>
        )}
      </Content>
      {(window.appSettings.USE_MSW || window.appSettings.MILJO === 'dev-gcp') && (
        <Rolleswitcher piloter={piloter} setPiloter={setPiloter} />
      )}
    </main>
  )
}

export default Index
