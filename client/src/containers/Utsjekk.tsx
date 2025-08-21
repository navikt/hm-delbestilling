import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ArrowLeftIcon, TrashIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyShort,
  Button,
  ConfirmationPanel,
  GuidePanel,
  Heading,
  HStack,
  Loader,
  Radio,
  RadioGroup,
  Select,
  VStack,
} from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import { Beskrivelser } from '../components/Beskrivelser'
import { Bilde } from '../components/Bilde'
import Errors from '../components/Errors'
import { Feilmelding, FeilmeldingInterface } from '../components/Feilmelding'
import Content from '../components/Layout/Content'
import { CustomBox } from '../components/Layout/CustomBox'
import FlexedStack from '../components/Layout/FlexedStack'
import LeggTilDel from '../components/LeggTilDel'
import Lenke from '../components/Lenke'
import Rolleswitcher from '../components/Rolleswitcher'
import rest from '../services/rest'
import { Del, Delbestilling, Handlekurv, Levering, Pilot } from '../types/Types'
import {
  logBestillingSlettet,
  logInnsendingFeil,
  logInnsendingGjort,
  logSkjemavalideringFeilet,
} from '../utils/amplitude'

import { SESSIONSTORAGE_HANDLEKURV_KEY } from './Index'

import styles from '../styles/Containers.module.css'

export interface Valideringsfeil {
  id: 'levering' | 'deler' | 'opplæring-batteri' | 'batteri-bestilt-innen-ett-år'
  type: 'mangler levering' | 'ingen deler' | 'mangler opplæring' | 'batteri-bestilt-innen-ett-år'
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

  const handlekurvInneholderBatteri = !!handlekurv?.deler.some((delLinje) => delLinje.del.kategori === 'Batteri')

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
          feilmelding: t(`error.${response.feil}`),
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
    <main style={{ '--main-bg-color': 'white' } as React.CSSProperties}>
      <Content>
        <>
          {visFlereDeler && (
            <Avstand marginBottom={6}>
              <Button icon={<ArrowLeftIcon />} variant="tertiary" onClick={() => setVisFlereDeler(false)}>
                {t('bestillinger.tilbakeTilBestillingen')}
              </Button>
            </Avstand>
          )}
          <CustomBox>
            <Heading level="2" size="small" spacing>
              {t('bestillinger.bestillDelerTil', { navn: handlekurv.hjelpemiddel.navn })}
            </Heading>
            <BodyShort style={{ display: 'flex', gap: '20px' }}>
              <span>Art.nr. {handlekurv.hjelpemiddel.hmsnr}</span>
              <span>Serienr. {handlekurv.serienr}</span>
            </BodyShort>
          </CustomBox>
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
                    <CustomBox>
                      <FlexedStack>
                        <Bilde imgs={delLinje.del.imgs} navn={delLinje.del.navn} />
                        <Beskrivelser>
                          <Heading size="small" level="4" spacing>
                            {delLinje.del.navn}
                          </Heading>
                          <HStack gap="5">
                            <BodyShort textColor="subtle">HMS-nr. {delLinje.del.hmsnr}</BodyShort>
                            {delLinje.del.levArtNr && (
                              <BodyShort textColor="subtle">Lev.art.nr. {delLinje.del.levArtNr}</BodyShort>
                            )}
                          </HStack>
                        </Beskrivelser>
                      </FlexedStack>
                      <div className={styles.toolbar}>
                        <Button icon={<TrashIcon />} variant="tertiary" onClick={() => handleSlettDel(delLinje.del)}>
                          {t('bestillinger.slettDel')}
                        </Button>
                        <Select
                          label="Antall"
                          value={delLinje.antall}
                          onChange={(e) => setAntall(delLinje.del, Number(e.target.value))}
                          size="small"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </Select>
                      </div>
                    </CustomBox>
                  </Avstand>
                ))}
                <Avstand marginBottom={4} />
                <Button variant="secondary" onClick={() => setVisFlereDeler(true)}>
                  {handlekurv.deler.length > 0 ? t('bestillinger.leggTilFlereDeler') : t('bestillinger.leggTilDeler')}
                </Button>
              </Avstand>

              {handlekurvInneholderBatteri && (
                <Avstand marginBottom={8}>
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
              )}

              <Avstand marginBottom={12}>
                <Heading spacing level="3" size="medium">
                  {t('levering.Levering')}
                </Heading>

                {harXKLager === undefined && <Loader />}
                {harXKLager === false && <Alert variant="info">{t('bestillinger.delBlirLevertTilKommunen')}</Alert>}
                {harXKLager === true && (
                  <RadioGroup
                    id="levering"
                    legend={t('levering.title')}
                    value={handlekurv.levering ?? ''}
                    onChange={(levering: Levering) => setLevering(levering)}
                    error={!!valideringsFeil.find((feil) => feil.id === 'levering')}
                  >
                    <Radio value={Levering.TIL_XK_LAGER} data-testid="levering-xk-lager">
                      {t('levering.xkLager')}
                    </Radio>
                    <Radio value={Levering.TIL_SERVICE_OPPDRAG} data-testid="levering-serviceOppdrag">
                      {t('levering.serviceOppdrag')}
                    </Radio>
                  </RadioGroup>
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

export default Utsjekk
