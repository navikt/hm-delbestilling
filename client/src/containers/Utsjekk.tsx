import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { ArrowLeftIcon, TrashIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyShort,
  Button,
  ConfirmationPanel,
  GuidePanel,
  Heading,
  Loader,
  Radio,
  RadioGroup,
  Select,
  VStack,
} from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import DelInfo from '../components/DelInfo'
import Errors from '../components/Errors'
import { Feilmelding, FeilmeldingInterface } from '../components/Feilmelding'
import LeggTilDel from '../components/LeggTilDel'
import Lenke from '../components/Lenke'
import Rolleswitcher from '../components/Rolleswitcher'
import { GlobalStyle } from '../GlobalStyle'
import rest from '../services/rest'
import Content from '../styledcomponents/Content'
import { CustomPanel } from '../styledcomponents/CustomPanel'
import FlexedStack from '../styledcomponents/FlexedStack'
import { DelbestillingFeil, Pilot } from '../types/HttpTypes'
import { Del, Delbestilling, Handlekurv, Levering } from '../types/Types'
import {
  logBestillingSlettet,
  logInnsendingFeil,
  logInnsendingGjort,
  logSkjemavalideringFeilet,
  logvisningAvBatteriVarsel,
} from '../utils/amplitude'

import { SESSIONSTORAGE_HANDLEKURV_KEY } from './Index'

const Toolbar = styled.div`
  padding: 1rem;
  background: #f7f7f7;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: -24px;
  margin-left: -24px;
  margin-top: 16px;
  width: calc(100% + 48px);
`

export interface Valideringsfeil {
  id: 'levering' | 'deler' | 'opplæring-batteri'
  type: 'mangler levering' | 'ingen deler' | 'mangler opplæring'
  melding: string
}

const Utsjekk = () => {
  const [handlekurv, setHandlekurv] = useState<Handlekurv | undefined>(() => {
    try {
      return JSON.parse(window.sessionStorage.getItem(SESSIONSTORAGE_HANDLEKURV_KEY) || '')
    } catch {
      return undefined
    }
  })
  const [visFlereDeler, setVisFlereDeler] = useState(false)
  const [senderInnBestilling, setSenderInnBestilling] = useState(false)
  const [submitAttempt, setSubmitAttempt] = useState(false)
  const [valideringsFeil, setValideringsFeil] = useState<Valideringsfeil[]>([])
  const [feilmelding, setFeilmelding] = useState<FeilmeldingInterface | undefined>()
  const [harXKLager, setHarXKLager] = useState<boolean | undefined>(undefined)
  const [piloter, setPiloter] = useState<Pilot[]>(handlekurv?.piloter ?? [])
  const { t } = useTranslation()

  const navigate = useNavigate()

  const handlekurvInneholderBatteri = handlekurv?.deler.some((delLinje) => delLinje.del.kategori === 'Batteri')

  useEffect(() => {
    // Innsendere i kommuner uten XK-lager skal ikke trenge å måtte gjøre et valg her
    if (harXKLager === false) {
      setLevering(Levering.TIL_SERVICE_OPPDRAG)
    }
  }, [harXKLager])

  useEffect(() => {
    ;(async () => {
      if (handlekurv && harXKLager === undefined) {
        try {
          const response = await rest.sjekkXKLager(handlekurv.hjelpemiddel.hmsnr, handlekurv.serienr)
          setHarXKLager(response.xkLager)
        } catch {
          setHarXKLager(false)
        }
      }
    })()
  }, [handlekurv, harXKLager])

  useEffect(() => {
    // Re-valider når felter oppdateres etter innsending har blitt forsøkt
    if (submitAttempt && handlekurv) {
      validerBestilling(handlekurv)
    }
  }, [submitAttempt, handlekurv])

  const leggTilDel = (del: Del) => {
    setHandlekurv((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        deler: [...prev.deler, { del, antall: del.defaultAntall }],
      }
    })

    setVisFlereDeler(false)
    window.scrollTo(0, 0)
  }

  const setAntall = (del: Del, antall: number) => {
    setHandlekurv((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        deler: prev.deler.map((handlekurvDel) => {
          if (handlekurvDel.del.hmsnr === del.hmsnr) return { ...handlekurvDel, antall }
          return handlekurvDel
        }),
      }
    })
  }

  const handleSlettDel = (del: Del) => {
    setHandlekurv((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        deler: prev.deler.filter((handlekurvDel) => {
          return handlekurvDel.del.hmsnr !== del.hmsnr
        }),
      }
    })
  }

  const setLevering = (levering: Levering) => {
    setHandlekurv((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        levering,
      }
    })
  }

  const hentInnsendingFeil = (innsendingFeil: DelbestillingFeil): string => {
    return t(`error.${innsendingFeil}`)
  }

  const validerBestilling = (handlekurv: Handlekurv) => {
    const feil: Valideringsfeil[] = []

    if (handlekurv.deler.length === 0) {
      feil.push({ id: 'deler', type: 'ingen deler', melding: 'Du kan ikke sende inn bestilling med ingen deler.' })
    }

    if (!handlekurv.levering) {
      feil.push({ id: 'levering', type: 'mangler levering', melding: 'Du må velge levering.' })
    }

    if (handlekurvInneholderBatteri && !handlekurv.harOpplæringPåBatteri) {
      feil.push({
        id: 'opplæring-batteri',
        type: 'mangler opplæring',
        melding: 'Du må bekrefte at du har fått opplæring i å bytte disse batteriene.',
      })
    }

    setValideringsFeil(feil)
    return feil
  }

  const sendInnBestilling = async (handlekurv: Handlekurv) => {
    setFeilmelding(undefined)
    setSubmitAttempt(true)

    const feil = validerBestilling(handlekurv)

    if (feil.length !== 0) {
      logSkjemavalideringFeilet(feil.map((f) => f.type))
      return
    }

    try {
      setSenderInnBestilling(true)
      const delbestilling: Delbestilling = {
        id: handlekurv.id,
        hmsnr: handlekurv.hjelpemiddel.hmsnr,
        serienr: handlekurv.serienr,
        navn: handlekurv.hjelpemiddel.navn,
        deler: handlekurv.deler,
        levering: handlekurv.levering!,
        harOpplæringPåBatteri: handlekurv.harOpplæringPåBatteri,
      }

      logInnsendingGjort(handlekurv.id)

      const response = await rest.sendInnBestilling(delbestilling)
      if (response.feil) {
        logInnsendingFeil(response.feil)
        setFeilmelding({
          feilmelding: hentInnsendingFeil(response.feil),
        })
      } else {
        navigate('/kvittering', {
          state: { delbestillingSak: response.delbestillingSak },
        })
      }
    } catch (err: any) {
      logInnsendingFeil('FEIL_FRA_BACKEND')
      if (err.isUnauthorized()) {
        setFeilmelding({
          feilmelding: (
            <>
              <Trans
                i18nKey={'error.sessionExpired'}
                components={{
                  link: <Lenke href="/hjelpemidler/delbestilling/login" lenketekst="her" />,
                }}
              />
            </>
          ),
        })
      } else {
        setFeilmelding({
          feilmelding: t('error.noeFeilMedInnsending'),
          tekniskFeilmelding: err,
        })
      }
    } finally {
      setSenderInnBestilling(false)
    }
  }

  const slettBestilling = () => {
    logBestillingSlettet()
    window.sessionStorage.removeItem(SESSIONSTORAGE_HANDLEKURV_KEY)
    navigate('/')
  }

  if (!handlekurv) {
    return (
      <Content>
        <Avstand paddingTop={8} paddingBottom={8}>
          <GuidePanel>
            <Trans
              i18nKey={'error.fantIngenHandlekurv'}
              components={{
                link: <Lenke href="/hjelpemidler/delbestilling/" lenketekst={t('felles.forsiden')} />,
              }}
            />
          </GuidePanel>
        </Avstand>
      </Content>
    )
  }

  return (
    <main>
      <GlobalStyle mainBg="white" />
      <Content>
        <>
          {visFlereDeler && (
            <Avstand marginBottom={6}>
              <Button icon={<ArrowLeftIcon />} variant="tertiary" onClick={() => setVisFlereDeler(false)}>
                {t('bestillinger.tilbakeTilBestillingen')}
              </Button>
            </Avstand>
          )}
          <CustomPanel border>
            <Heading level="2" size="small" spacing>
              {t('bestillinger.bestillDelerTil', { navn: handlekurv.hjelpemiddel.navn })}
            </Heading>
            <BodyShort style={{ display: 'flex', gap: '20px' }}>
              <span>Art.nr. {handlekurv.hjelpemiddel.hmsnr}</span>
              <span>Serienr. {handlekurv.serienr}</span>
            </BodyShort>
          </CustomPanel>
          <Avstand marginBottom={12} />
          {visFlereDeler ? (
            <LeggTilDel
              hjelpemiddel={{
                ...handlekurv.hjelpemiddel,
                // Filtrer bort deler som allerede er lagt til
                deler: handlekurv.hjelpemiddel.deler?.filter(
                  (del) => !handlekurv.deler.find((handlekurvDel) => handlekurvDel.del.hmsnr === del.hmsnr)
                ),
              }}
              onLeggTil={(del) => leggTilDel(del)}
              piloter={piloter}
            />
          ) : (
            <>
              <Avstand marginBottom={12}>
                <Heading level="3" size="medium" spacing id="deler">
                  {t('bestillinger.delerLagtTil')}
                </Heading>
                {handlekurv.deler.length === 0 && <BodyShort>{t('bestillinger.ikkeLagtTilDeler')}</BodyShort>}
                {handlekurv.deler.map((delLinje) => (
                  <Avstand marginBottom={2} key={delLinje.del.hmsnr}>
                    <CustomPanel border>
                      <FlexedStack>
                        <DelInfo
                          navn={delLinje.del.navn}
                          hmsnr={delLinje.del.hmsnr}
                          levArtNr={delLinje.del.levArtNr}
                          imgs={delLinje.del.imgs}
                        />
                      </FlexedStack>
                      <Toolbar>
                        <Button icon={<TrashIcon />} variant="tertiary" onClick={() => handleSlettDel(delLinje.del)}>
                          {t('bestillinger.slettDel')}
                        </Button>
                        <Select
                          label="Antall"
                          value={delLinje.antall}
                          onChange={(e) => setAntall(delLinje.del, Number(e.target.value))}
                          style={{ width: 80 }}
                        >
                          {Array.from(Array(delLinje.del.maksAntall), (_, x: number) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Select>
                      </Toolbar>
                    </CustomPanel>
                  </Avstand>
                ))}
                <Avstand marginBottom={4} />
                <Button variant="secondary" onClick={() => setVisFlereDeler(true)}>
                  {handlekurv.deler.length > 0 ? t('bestillinger.leggTilFlereDeler') : t('bestillinger.leggTilDeler')}
                </Button>
              </Avstand>

              {handlekurvInneholderBatteri && (
                <>
                  <Avstand marginBottom={4}>
                    <SisteBatteribestillingSjekk handlekurv={handlekurv} />
                  </Avstand>
                  <Avstand marginBottom={8}>
                    <Avstand marginBottom={4}>
                      <ConfirmationPanel
                        id={'opplæring-batteri'}
                        checked={!!handlekurv.harOpplæringPåBatteri}
                        label={t('bestillinger.harFåttOpplæringBatteri')}
                        onChange={(e) =>
                          setHandlekurv((prev) => {
                            if (!prev) return undefined
                            return {
                              ...prev,
                              harOpplæringPåBatteri: e.target.checked,
                            }
                          })
                        }
                        error={!!valideringsFeil.find((feil) => feil.id === 'opplæring-batteri')}
                      >
                        {t('felles.Bekreft')}
                      </ConfirmationPanel>
                    </Avstand>
                    <Alert variant="info">{t('bestillinger.gjenvinningAvBatterier')}</Alert>
                  </Avstand>
                </>
              )}

              <Avstand marginBottom={12}>
                <Heading spacing level="3" size="medium">
                  {t('levering.Levering')}
                </Heading>

                {harXKLager === undefined && <Loader />}
                {harXKLager === false && <Alert variant="info">{t('bestillinger.delBlirLevertTilKommunen')}</Alert>}
                {harXKLager === true && (
                  <>
                    <RadioGroup
                      id="levering"
                      legend={t('levering.title')}
                      value={handlekurv.levering ?? ''}
                      onChange={(levering: Levering) => setLevering(levering)}
                      error={!!valideringsFeil.find((feil) => feil.id === 'levering')}
                    >
                      <Radio value={Levering.TIL_XK_LAGER}>{t('levering.xkLager')}</Radio>
                      <Radio value={Levering.TIL_SERVICE_OPPDRAG}>{t('levering.serviceOppdrag')}</Radio>
                    </RadioGroup>
                  </>
                )}

                {valideringsFeil.length > 0 && (
                  <Avstand marginTop={4}>
                    <Errors valideringsFeil={valideringsFeil} />
                  </Avstand>
                )}
              </Avstand>

              {feilmelding && (
                <Avstand marginBottom={4}>
                  <Feilmelding feilmelding={feilmelding} />
                </Avstand>
              )}

              <VStack align="center" gap="3">
                <Button loading={senderInnBestilling} onClick={() => sendInnBestilling(handlekurv)}>
                  {t('bestillinger.sendInn')}
                </Button>
                <Button icon={<TrashIcon />} variant="tertiary" onClick={slettBestilling}>
                  {t('bestillinger.slett')}
                </Button>
              </VStack>
            </>
          )}
        </>
      </Content>
      {(window.appSettings.USE_MSW || window.appSettings.MILJO === 'dev-gcp') && (
        <Rolleswitcher
          harXKLager={harXKLager}
          setHarXKLager={setHarXKLager}
          piloter={piloter}
          setPiloter={setPiloter}
        />
      )}
    </main>
  )
}

const GRENSE_ANTALL_DAGER = 30 * 4 // 4 måneder
const SisteBatteribestillingSjekk = ({ handlekurv }: { handlekurv: Handlekurv }) => {
  const { t } = useTranslation()

  const [antallDagerSiden, setAntallDagerSiden] = useState<number | undefined>(undefined)

  useEffect(() => {
    ;(async () => {
      try {
        const sisteBatteribestilling = await rest.hentSisteBatteribestilling(
          handlekurv.hjelpemiddel.hmsnr,
          handlekurv.serienr
        )
        if (sisteBatteribestilling && sisteBatteribestilling.antallDagerSiden < GRENSE_ANTALL_DAGER) {
          setAntallDagerSiden(sisteBatteribestilling.antallDagerSiden)
          logvisningAvBatteriVarsel(handlekurv.id, sisteBatteribestilling.antallDagerSiden)
        }
      } catch {
        console.log('Klarte ikke sjekke om batteri er bestilt for kort tid siden')
      }
    })()
  }, [GRENSE_ANTALL_DAGER])

  if (antallDagerSiden === undefined) {
    return null
  }

  return (
    <Avstand marginBottom={4}>
      <Alert variant="info">
        {t('bestillinger.batteriSistBestiltVarsel', {
          count: antallDagerSiden,
        })}
      </Alert>
    </Avstand>
  )
}

export default Utsjekk
