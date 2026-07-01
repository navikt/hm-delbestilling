import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { PencilIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Heading, HStack, InfoCard, Loader, Stack, VStack } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import Content from '../components/Layout/Content'
import { CustomBox } from '../components/Layout/CustomBox'
import LeggTilDel from '../components/LeggTilDel'
import Rolleswitcher from '../components/Rolleswitcher/Rolleswitcher'
import useAuth from '../hooks/useAuth'
import { Del, Handlekurv, Hjelpemiddel, HjelpemiddelUtenDeler, Pilot } from '../types/Types'
import { isProd } from '../utils/utils'
import rest from '../services/rest'
import { FeilmeldingInterface } from '../components/Feilmelding'
import { logOppslagFeil, logOppslagGjort } from '../utils/analytics/analytics'
import { OppslagFeil } from '../types/HttpTypes'


const Delvelger = () => {
  const [searchParams] = useSearchParams()
  const hmsnr = searchParams.get('hmsnr') ?? ''
  const serienr = searchParams.get('serienr') ?? undefined
  const brukernr = searchParams.get('brukernr') ?? undefined
  const [hjelpemiddel, setHjelpemiddel] = useState<Hjelpemiddel | undefined>(undefined)
  const [piloter, setPiloter] = useState<Pilot[]>([])
  const [slårOppDeler, setSlårOppDeler] = useState(false)
  const [feilmelding, setFeilmelding] = useState<FeilmeldingInterface | undefined>()

  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleBestill = async (hjelpemiddel: Hjelpemiddel, del: Del) => {
    // TODO
    const handlekurv: Handlekurv = {
      id: uuidv4(),
      serienr,
      brukernr,
      hjelpemiddel,
      deler: [{ del, antall: del.defaultAntall }],
      levering: undefined,
      harOpplæringPåBatteri: undefined,
      piloter,
    }

    navigate('/utsjekk', { state: handlekurv })
  }

  const slåOppDeler = async () => {
    try {
      setSlårOppDeler(true)
      logOppslagGjort(hmsnr)
      const oppslag = await rest.hjelpemiddelOppslag(hmsnr, serienr, brukernr)

      if (oppslag.feil) {
        setFeilmelding({
          feilmelding: t(`oppslagfeil.${oppslag.feil}`),
          status: oppslag.feil === OppslagFeil.INGET_UTLÅN ? 'error' : 'warning',
        })
        logOppslagFeil(oppslag.feil, hmsnr)
      } else {
        setHjelpemiddel(oppslag.hjelpemiddel)
      }
    } catch (err: any) {
      console.log(`Kunne ikke hente hjelpemiddel`, err)
      logOppslagFeil('FEIL_FRA_BACKEND', hmsnr, err.statusCode)
      let feilmelding = ''
      if (err.isTooManyRequests()) {
        feilmelding = t('error.forMangeOppslag')
      } else {
        feilmelding = t('error.noeGikkGalt')
      }
      setFeilmelding({
        feilmelding,
        tekniskFeilmelding: err,
      })
    } finally {
      setSlårOppDeler(false)
    }
  }

  useEffect(() => {
    slåOppDeler()
  }, [])

  if (slårOppDeler) {
    return (
      <main>
        <Content>
          <HStack justify="center" style={{ height: '100%' }}>
            <Loader size="2xlarge" title={t('bestillinger.henterDeler')} />
          </HStack>
        </Content>
      </main>
    )
  }

  if (feilmelding) {
    return (
      <main>
        <Content>
          <Avstand marginTop={32} marginBottom={48}>
            <InfoCard data-color="warning">
              <InfoCard.Header>
                <InfoCard.Title>Feil</InfoCard.Title>
              </InfoCard.Header>
              <InfoCard.Content>
                <VStack gap="space-20">
                  {feilmelding.feilmelding}

                  <Stack>
                    <Button variant="secondary" onClick={() => navigate('/')}>
                      {t('feilside.prøvPåNytt')}
                    </Button>
                  </Stack>
                </VStack>
              </InfoCard.Content>
            </InfoCard>
          </Avstand>
        </Content>
      </main>
    )
  }

  return (
    <main>
      <Content>
        {hjelpemiddel && (
          <>
            <CustomBox>
              <HStack align="end" justify="space-between">
                <div>
                  <Heading size="xsmall" level="2" spacing data-testid="hjelpemiddel-navn">
                    {t('bestillinger.bestillingTil', { navn: hjelpemiddel.navn })}
                  </Heading>
                  <HStack gap="space-24">
                    <BodyShort>Art.nr. {hmsnr}</BodyShort>
                    {serienr && (<BodyShort>Serienr. {serienr}</BodyShort>)}
                    {brukernr && (<BodyShort>Brukernr. {brukernr}</BodyShort>)}
                  </HStack>
                </div>
                <Button
                  icon={<PencilIcon />}
                  variant="tertiary"
                  onClick={() => {
                    navigate('/')
                  }}
                >
                  {t('felles.Endre')}
                </Button>
              </HStack>
            </CustomBox>
            <Avstand marginBottom={48} />
            <LeggTilDel hjelpemiddel={hjelpemiddel} onLeggTil={(del) => handleBestill(hjelpemiddel, del)} />
          </>
        )}
      </Content>
      {!isProd() && <Rolleswitcher piloter={piloter} setPiloter={setPiloter} />}
    </main>
  )
}

export default Delvelger
