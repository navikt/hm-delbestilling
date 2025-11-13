import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { PencilIcon } from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Box, Button, Heading, HStack, Link, LinkCard } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import HjelpemiddelLookup from '../components/HjelpemiddelLookup'
import Content from '../components/Layout/Content'
import { CustomBox } from '../components/Layout/CustomBox'
import LeggTilDel from '../components/LeggTilDel'
import Lenke from '../components/Lenke'
import OmÅBestilleDeler from '../components/OmÅBestilleDeler'
import Rolleswitcher from '../components/Rolleswitcher/Rolleswitcher'
import useAuth from '../hooks/useAuth'
import { Del, Handlekurv, Hjelpemiddel, Pilot } from '../types/Types'
import { isProd } from '../utils/utils'

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
              <Link
                href="#"
                style={{ display: 'block', width: '100%' }}
                onClick={(e) => {
                  e.preventDefault()
                  if (erLoggetInn) {
                    navigate('/bestillinger')
                  } else {
                    window.location.replace('/hjelpemidler/delbestilling/login?redirect=bestillinger')
                  }
                }}
              >
                <LinkCard style={{ border: '1px solid' }}>
                  <LinkCard.Title>{t('bestillinger.dineSiste')}</LinkCard.Title>
                  {!sjekkerLogin && !erLoggetInn && (
                    <LinkCard.Description>{t('bestillinger.loggInnForÅSeBestillinger')}</LinkCard.Description>
                  )}
                </LinkCard>
              </Link>
            </Avstand>

            <Avstand marginTop={10}>
              <OmÅBestilleDeler />
            </Avstand>

            <Avstand marginTop={10}>
              <Box.New padding="4" background="default" borderRadius="12">
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
              </Box.New>
            </Avstand>
          </>
        )}
        {hjelpemiddel && (
          <>
            <CustomBox>
              <HStack align="end" justify="space-between">
                <div>
                  <Heading size="xsmall" level="2" spacing data-testid="hjelpemiddel-navn">
                    {t('bestillinger.bestillingTil', { navn: hjelpemiddel.navn })}
                  </Heading>
                  <HStack gap="5">
                    <BodyShort>Art.nr. {hmsnr}</BodyShort>
                    <BodyShort>Serienr. {serienr}</BodyShort>
                  </HStack>
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
            </CustomBox>
            <Avstand marginBottom={12} />
            <LeggTilDel
              hjelpemiddel={hjelpemiddel}
              onLeggTil={(del) => handleBestill(hjelpemiddel, del)}
              knappeTekst={t('bestillinger.bestill')}
              piloter={piloter}
            />
          </>
        )}
      </Content>
      {!isProd() && <Rolleswitcher piloter={piloter} setPiloter={setPiloter} />}
    </main>
  )
}

export default Index
