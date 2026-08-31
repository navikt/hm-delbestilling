import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { ArrowLeftIcon, TrashIcon } from '@navikt/aksel-icons'
import {
  BodyShort,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  GuidePanel,
  Heading,
  HStack,
  InfoCard,
  Label,
  Loader,
  Radio,
  RadioGroup,
  Select,
  TextField,
  VStack,
} from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import { Beskrivelser } from '../components/Beskrivelser/Beskrivelser'
import { Bilde } from '../components/Bilde/Bilde'
import Errors from '../components/Errors'
import { Feilmelding, FeilmeldingInterface } from '../components/Feilmelding'
import InfoOmDel from '../components/InfoOmDel'
import Content from '../components/Layout/Content'
import { CustomBox } from '../components/Layout/CustomBox'
import FlexedStack from '../components/Layout/FlexedStack'
import LeggTilDel from '../components/LeggTilDel'
import Lenke from '../components/Lenke'
import Rolleswitcher from '../components/Rolleswitcher/Rolleswitcher'
import rest from '../services/rest'
import { Del, Delbestilling, Handlekurv, Levering, Pilot, UkjentDel } from '../types/Types'
import {
  logBestillingSlettet,
  logInnsendingFeil,
  logInnsendingGjort,
  logSkjemavalideringFeilet,
} from '../utils/analytics/analytics'
import { isProd } from '../utils/utils'

export interface Valideringsfeil {
  id: 'levering' | 'deler' | 'opplæring-batteri' | 'batteri-bestilt-innen-ett-år' | 'epost-tekniker'
  type: 'mangler levering' | 'ingen deler' | 'mangler opplæring' | 'batteri-bestilt-innen-ett-år' | 'mangler eller ugyldig epost'
  melding: string
}

const MAKS_ANTALL_UKJENT_DEL = 4 
const epostRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Utsjekk = () => {
  const location = useLocation()
  const [handlekurv, setHandlekurv] = useState<Handlekurv | undefined>(location.state as Handlekurv | undefined)
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

  const inneholderUkjentDel = (handlekurv?.ukjenteDeler.length ?? 0) > 0

  useEffect(() => {
    // Innsendere i kommuner uten XK-lager skal ikke trenge å måtte gjøre et valg her
    if (harXKLager === false) {
      setLevering(Levering.TIL_SERVICE_OPPDRAG)
    }
  }, [harXKLager])

  useEffect(() => {
    ; (async () => {
      if (handlekurv && harXKLager === undefined) {
        try {
          const response = await rest.sjekkXKLager(handlekurv.hjelpemiddel.hmsnr, handlekurv.serienr, handlekurv.brukernr)
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

  const leggTilUkjentDel = (del: UkjentDel) => {
    setHandlekurv((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        ukjenteDeler: [...prev.ukjenteDeler, { delUkjent: del, antall: 1 }],
      }
    })

    setVisFlereDeler(false)
    window.scrollTo(0, 0)
  }

  const setAntallForDel = (del: Del, antall: number) => {
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

  const setAntallForUkjentDel = (del: UkjentDel, antall: number) => {
    setHandlekurv((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        ukjenteDeler: prev.ukjenteDeler.map((handlekurvDel) => {
          if (handlekurvDel.delUkjent.hmsnr === del.hmsnr && handlekurvDel.delUkjent.levArtNr === del.levArtNr) return { ...handlekurvDel, antall }
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

  const handleSlettUkjentDel = (del: UkjentDel) => {
    setHandlekurv((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        ukjenteDeler: prev.ukjenteDeler.filter((handlekurvDel) => {
          return !(handlekurvDel.delUkjent.hmsnr === del.hmsnr && handlekurvDel.delUkjent.levArtNr === del.levArtNr)
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

    const inneholderUkjentDel = handlekurv.ukjenteDeler.length > 0

    if (handlekurv.deler.length === 0 && handlekurv.ukjenteDeler.length === 0) {
      feil.push({ id: 'deler', type: 'ingen deler', melding: 'Du kan ikke sende inn en bestilling uten deler.' })
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

    if (inneholderUkjentDel) {
      const epost = handlekurv.epostTekniker?.trim() ?? ''

      if (!epostRegex.test(epost)) {
        feil.push({
          id: 'epost-tekniker',
          type: 'mangler eller ugyldig epost',
          melding: t('bestillinger.epostTekniker.error'),
        })
      }
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
        navn: handlekurv.hjelpemiddel.navn,
        deler: handlekurv.deler,
        ukjenteDeler: handlekurv.ukjenteDeler,
        levering: handlekurv.levering!,
        harOpplæringPåBatteri: handlekurv.harOpplæringPåBatteri,
        epostTekniker: inneholderUkjentDel ? handlekurv.epostTekniker?.trim() || null : null,
        // Default til undefined hvis serienr eller brukernr er tom string, for å matche backend-validering
        serienr: handlekurv.serienr || undefined,
        brukernr: handlekurv.brukernr || undefined,
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
                  link: <Lenke href="/hjelpemidler/delbestilling/oauth2/login" lenketekst="her" />,
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
    navigate('/')
  }

  if (!handlekurv) {
    return (
      <Content>
        <Avstand paddingTop={32} paddingBottom={32}>
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

  console.log('handlekurv', handlekurv)
  return (
    <main style={{ '--main-bg-color': 'white' } as React.CSSProperties}>
      <Content>
        <>
          {visFlereDeler && (
            <Avstand marginBottom={24}>
              <Button icon={<ArrowLeftIcon />} variant="tertiary" onClick={() => setVisFlereDeler(false)}>
                {t('bestillinger.tilbakeTilBestillingen')}
              </Button>
            </Avstand>
          )}
          <CustomBox>
            <Heading level="2" size="small" spacing>
              {t('bestillinger.bestillDelerTil', { navn: handlekurv.hjelpemiddel.navn })}
            </Heading>
            <HStack gap="space-24" >
              <BodyShort>Art.nr. {handlekurv.hjelpemiddel.hmsnr}</BodyShort>
              {handlekurv.brukernr && <BodyShort>Brukernr. {handlekurv.brukernr}</BodyShort>}
              {handlekurv.serienr && <BodyShort>Serienr. {handlekurv.serienr}</BodyShort>}
            </HStack>
          </CustomBox>
          <Avstand marginBottom={48} />
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
              onLeggTilUkjent={(del) => leggTilUkjentDel(del)}
              handlekurv={handlekurv}
            />
          ) : (
            <>
              <Avstand marginBottom={48}>
                <Heading level="3" size="medium" spacing id="deler">
                  {t('bestillinger.delerLagtTil')}
                </Heading>
                {handlekurv.deler.length === 0 && handlekurv.ukjenteDeler.length === 0 && <BodyShort>{t('bestillinger.ikkeLagtTilDeler')}</BodyShort>}
                {handlekurv.deler.map((delLinje) => (
                  <Avstand marginBottom={8} key={delLinje.del.hmsnr}>
                    <CustomBox>
                      <FlexedStack>
                        <Bilde imgs={delLinje.del.imgs} navn={delLinje.del.navn} />
                        <Beskrivelser>
                          <InfoOmDel del={delLinje.del} erFastLagervare={delLinje.del.lagerstatus.minmax} />
                        </Beskrivelser>
                      </FlexedStack>
                      <Box paddingBlock="space-4">
                        <HStack gap="space-4" align="end" justify="space-between">
                          <Button icon={<TrashIcon />} variant="tertiary" onClick={() => handleSlettDel(delLinje.del)}>
                            {t('bestillinger.slettDel')}
                          </Button>
                          <Select
                            label="Antall"
                            value={delLinje.antall}
                            onChange={(e) => setAntallForDel(delLinje.del, Number(e.target.value))}
                            size="small"
                          >
                            {Array.from(Array(delLinje.del.maksAntall), (_, x: number) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            ))}
                          </Select>
                        </HStack>
                      </Box>
                    </CustomBox>
                  </Avstand>
                ))}

                {handlekurv.ukjenteDeler.map((delLinje) => (
                  <Avstand marginBottom={8} key={`${delLinje.delUkjent.hmsnr}-${delLinje.delUkjent.levArtNr}`}>
                    <CustomBox>
                      <VStack gap="space-8">
                        {delLinje.delUkjent.hmsnr && (
                          <HStack gap="space-8">
                            <Label>HMS-nr:</Label>
                            <BodyShort>{delLinje.delUkjent.hmsnr}</BodyShort>
                          </HStack>
                        )}
                        {delLinje.delUkjent.levArtNr && (
                          <HStack gap="space-8">
                            <Label>Lev.art.nr:</Label>
                            <BodyShort>{delLinje.delUkjent.levArtNr}</BodyShort>
                          </HStack>
                        )}
                        {delLinje.delUkjent.beskrivelse && (
                          <HStack gap="space-8">
                            <Label>{t('leggTilDel.ukjentDel.beskrivelse')}:</Label>
                            <BodyShort>{delLinje.delUkjent.beskrivelse}</BodyShort>
                          </HStack>
                        )}
                      </VStack>
                      <Box paddingBlock="space-4">
                        <HStack gap="space-4" align="end" justify="space-between">
                          <Button icon={<TrashIcon />} variant="tertiary" onClick={() => handleSlettUkjentDel(delLinje.delUkjent)}>
                            {t('bestillinger.slettDel')}
                          </Button>
                          <Select
                            label="Antall"
                            value={delLinje.antall}
                            onChange={(e) => setAntallForUkjentDel(delLinje.delUkjent, Number(e.target.value))}
                            size="small"
                          >
                            {Array.from(Array(MAKS_ANTALL_UKJENT_DEL), (_, x: number) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            ))}
                          </Select>
                        </HStack>
                      </Box>
                    </CustomBox>
                  </Avstand>
                ))}

                <Avstand marginBottom={16} />
                <Button variant="secondary" onClick={() => setVisFlereDeler(true)}>
                  {handlekurv.deler.length > 0 ? t('bestillinger.leggTilFlereDeler') : t('bestillinger.leggTilDeler')}
                </Button>
              </Avstand>

              {handlekurvInneholderBatteri && (
                <Avstand marginBottom={32}>
                  <CheckboxGroup
                    legend={t('bestillinger.harFåttOpplæringBatteri')}
                    onChange={(values) => {
                      setHandlekurv((prev) => {
                        if (!prev) return undefined
                        return {
                          ...prev,
                          harOpplæringPåBatteri: !!values[0],
                        }
                      })
                    }}
                    error={!!valideringsFeil.find((feil) => feil.id === 'opplæring-batteri')}
                  >
                    <Checkbox id={'opplæring-batteri'} value={true}>
                      {t('felles.Bekreft')}
                    </Checkbox>
                  </CheckboxGroup>
                </Avstand>
              )}

              <Avstand marginBottom={48}>
                <Heading spacing level="3" size="medium">
                  {t('levering.Levering')}
                </Heading>

                {harXKLager === undefined && <Loader />}
                {harXKLager === false && (
                  <InfoCard data-color="info">
                    <InfoCard.Header>
                      <InfoCard.Title>{t('bestillinger.delBlirLevertTilKommunen.tittel')}</InfoCard.Title>
                    </InfoCard.Header>
                    <InfoCard.Content>{t('bestillinger.delBlirLevertTilKommunen.innhold')}</InfoCard.Content>
                  </InfoCard>
                )}
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

                {inneholderUkjentDel && (
                  <Avstand marginBottom={32} marginTop={32}>
                    <Heading spacing level="3" size="medium">
                      {t('bestillinger.epostTekniker.heading')}
                    </Heading>
                    <BodyShort spacing>{t('bestillinger.epostTekniker.description')}</BodyShort>
                    <TextField
                      style={{ width: '400px', maxWidth: '100%' }}
                      label={t('bestillinger.epostTekniker.label')}
                      type="email"
                      value={handlekurv.epostTekniker ?? ''}
                      onChange={(event) => {
                        const epostTekniker = event.target.value

                        setHandlekurv((prev) =>
                          prev
                            ? {
                              ...prev,
                              epostTekniker,
                            }
                            : undefined,
                        )
                      }}
                    />
                  </Avstand>
                )}

                {valideringsFeil.length > 0 && (
                  <Avstand marginTop={16}>
                    <Errors valideringsFeil={valideringsFeil} />
                  </Avstand>
                )}
              </Avstand>

              {feilmelding && (
                <Avstand marginBottom={16}>
                  <Feilmelding feilmelding={feilmelding} />
                </Avstand>
              )}



              <VStack align="center" gap="space-12">
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
      {!isProd() && (
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
