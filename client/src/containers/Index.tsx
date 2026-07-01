import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { BodyLong, Heading, Link, LinkCard } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import HjelpemiddelLookup from '../components/HjelpemiddelLookup'
import Content from '../components/Layout/Content'
import { CustomBox } from '../components/Layout/CustomBox'
import Lenke from '../components/Lenke'
import OmÅBestilleDeler from '../components/OmÅBestilleDeler'
import Rolleswitcher from '../components/Rolleswitcher/Rolleswitcher'
import useAuth from '../hooks/useAuth'
import { Hjelpemiddel, HjelpemiddelUtenDeler, Pilot } from '../types/Types'
import { isProd } from '../utils/utils'

export const SESSIONSTORAGE_HANDLEKURV_KEY = 'hm-delbestilling-handlekurv'

const Index = () => {
  const [hmsnr, setHmsnr] = useState('')
  const [serienr, setSerienr] = useState('')
  const [brukernr, setBrukernr] = useState('')
  const [hjelpemiddelUtenDeler, setHjelpemiddelUtenDeler] = useState<HjelpemiddelUtenDeler | undefined>(undefined)
  const [piloter, setPiloter] = useState<Pilot[]>([])
  const [erLoggetInn, setErLoggetInn] = useState(false)

  const { sjekkerLogin, sjekkLoginStatus } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    sjekkLoginStatus().then(setErLoggetInn)
  }, [])

  return (
    <main>
      <Content>
        <>
          <HjelpemiddelLookup
            hmsnr={hmsnr}
            setHmsnr={setHmsnr}
            serienr={serienr}
            setSerienr={setSerienr}
            brukernr={brukernr}
            setBrukernr={setBrukernr}
            onOppslagUtenDelerSuksess={(hjelpemiddelUtenDeler) => {
              setHjelpemiddelUtenDeler(hjelpemiddelUtenDeler)
            }}
            hjelpemiddelUtenDeler={hjelpemiddelUtenDeler}
            erLoggetInn={erLoggetInn}
          />


          <Avstand marginTop={24}>
            <Link
              href="#"
              style={{ display: 'block', width: '100%' }}
              onClick={(e) => {
                e.preventDefault()
                if (erLoggetInn) {
                  navigate('/bestillinger')
                } else {
                  window.location.replace(
                    '/hjelpemidler/delbestilling/oauth2/login?redirect=/hjelpemidler/delbestilling/bestillinger'
                  )
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

          <Avstand marginTop={24}>
            <OmÅBestilleDeler />
          </Avstand>

          <Avstand marginTop={24}>
            <CustomBox>
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
            </CustomBox>
          </Avstand>
        </>
      </Content>
      {!isProd() && <Rolleswitcher piloter={piloter} setPiloter={setPiloter} />}
    </main>
  )
}

export default Index
