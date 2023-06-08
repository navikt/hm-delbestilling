import React, { useEffect, useState } from 'react'
import { Alert, BodyShort, Button, ExpansionCard, Heading, Panel, Radio, RadioGroup, Select } from '@navikt/ds-react'
import { Avstand } from '../components/Avstand'
import LeggTilDel from '../components/LeggTilDel'
import Content from '../styledcomponents/Content'
import { HjelpemiddelDel, Delbestilling, Handlekurv, Levering } from '../types/Types'
import { DelbestillingFeil } from '../types/HttpTypes'
import { TrashIcon, ArrowLeftIcon } from '@navikt/aksel-icons'
import { useNavigate } from 'react-router-dom'
import { LOCALSTORAGE_HANDLEKURV_KEY } from './Index'
import styled from 'styled-components'
import rest from '../services/rest'
import { useRolleContext } from '../context/rolle'
import Errors from '../components/Errors'
import { logBestillingSlettet, logInnsendingFeil, logSkjemavalideringFeilet } from '../utils/amplitude'
import Rolleswitcher from '../components/Rolleswitcher'

const Toolbar = styled.div`
  padding: 1rem;
  background: #f1f1f1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: -16px;
  margin-left: -16px;
  width: calc(100% + 32px);
`

interface Feilmelding {
  melding: React.ReactNode
  stack?: string
}

export interface Valideringsfeil {
  id: 'levering' | 'deler'
  type: 'mangler levering' | 'ingen deler'
  melding: string
}

const Utsjekk = () => {
  const { delbestillerRolle } = useRolleContext()
  const [handlekurv, setHandlekurv] = useState<Handlekurv | undefined>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(LOCALSTORAGE_HANDLEKURV_KEY) || '')
    } catch {
      return undefined
    }
  })
  const [visFlereDeler, setVisFlereDeler] = useState(false)
  const [senderInnBestilling, setSenderInnBestilling] = useState(false)
  const [submitAttempt, setSubmitAttempt] = useState(false)
  const [valideringsFeil, setValideringsFeil] = useState<Valideringsfeil[]>([])
  const [feilmelding, setFeilmelding] = useState<Feilmelding | undefined>()

  const navigate = useNavigate()

  useEffect(() => {
    // Innsendere i kommuner uten XK-lager skal ikke trenge å måtte gjøre et valg her
    if (!delbestillerRolle.harXKLager) {
      setLevering(Levering.TIL_SERVICE_OPPDRAG)
    }
  }, [])

  useEffect(() => {
    // Re-valider når felter oppdateres etter innsending har blitt forsøkt
    if (submitAttempt && handlekurv) {
      validerBestilling(handlekurv)
    }
  }, [submitAttempt, handlekurv])

  const leggTilDel = (del: HjelpemiddelDel) => {
    setHandlekurv((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        deler: [...prev.deler, { ...del, antall: 1 }],
      }
    })

    setVisFlereDeler(false)
  }

  const setAntall = (del: HjelpemiddelDel, antall: number) => {
    setHandlekurv((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        deler: prev.deler.map((handlekurvDel) => {
          if (handlekurvDel.hmsnr === del.hmsnr) return { ...handlekurvDel, antall }
          return handlekurvDel
        }),
      }
    })
  }

  const handleSlettDel = (del: HjelpemiddelDel) => {
    setHandlekurv((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        deler: prev.deler.filter((handlekurvDel) => {
          return handlekurvDel.hmsnr !== del.hmsnr
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
    switch (innsendingFeil) {
      case DelbestillingFeil.ULIK_GEOGRAFISK_TILKNYTNING:
        return 'Du kan ikke bestille deler til bruker som ikke tilhører den kommunen du jobber i'
      case DelbestillingFeil.INGET_UTLÅN:
        return 'Det finnes ikke noe utlån for denne brukeren på dette artikkel- og serienummer'
      case DelbestillingFeil.BRUKER_IKKE_FUNNET:
        return 'Vi klarte ikke å finne noen bruker knyttet til dette artikkel- og serienummer'
      case DelbestillingFeil.BESTILLE_TIL_SEG_SELV:
        return 'Du har ikke lov til å bestille deler til produkter du selv har utlån på'
      default:
        return 'Ukjent feil'
    }
  }

  const validerBestilling = (handlekurv: Handlekurv) => {
    const feil: Valideringsfeil[] = []

    if (handlekurv.deler.length === 0) {
      feil.push({ id: 'deler', type: 'ingen deler', melding: 'Du kan ikke sende inn bestilling med ingen deler' })
    }

    if (!handlekurv.levering) {
      feil.push({ id: 'levering', type: 'mangler levering', melding: 'Du må velge levering' })
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
        deler: handlekurv.deler,
        levering: handlekurv.levering!,
      }

      const response = await rest.sendInnBestilling(delbestilling)
      if (response.feil) {
        logInnsendingFeil(response.feil)
        setFeilmelding({
          melding: hentInnsendingFeil(response.feil),
        })
      } else {
        navigate('/kvittering', { state: { handlekurv } })
      }
    } catch (err: any) {
      if (err.statusCode === 401) {
        setFeilmelding({
          melding: (
            <>
              Økten din er utløpt, og du må logge inn på nytt for å kunne sende inn bestillingen. Trykk{' '}
              <a href="/hjelpemidler/delbestilling/login">her</a> for å gjøre det.
            </>
          ),
        })
      } else {
        setFeilmelding({
          melding: 'Noe gikk feil med innsending, prøv igjen senere',
          stack: err as string,
        })
      }
      console.log(err)
    } finally {
      setSenderInnBestilling(false)
    }
  }

  const slettBestilling = () => {
    logBestillingSlettet()
    window.localStorage.removeItem(LOCALSTORAGE_HANDLEKURV_KEY)
    navigate('/')
    window.scrollTo(0, 0)
  }

  console.log('handlekurv:', handlekurv)

  if (!handlekurv) {
    return (
      <>
        Fant ingen handlekurv. Gå til <a href="/hjelpemidler/delbestilling/">forsiden.</a>
      </>
    )
  }

  return (
    <main style={{ background: 'white' }}>
      <Content>
        <>
          {visFlereDeler && (
            <Avstand marginBottom={2}>
              <Button icon={<ArrowLeftIcon />} variant="tertiary" onClick={() => setVisFlereDeler(false)}>
                Tilbake til bestillingen
              </Button>
            </Avstand>
          )}
          <Panel border>
            <Heading level="3" size="small" spacing>
              Bestill deler til {handlekurv.hjelpemiddel.navn}
            </Heading>
            <BodyShort>
              <strong>Art.nr:</strong> {handlekurv.hjelpemiddel.hmsnr} | <strong>Serienr:</strong> {handlekurv.serienr}
            </BodyShort>
          </Panel>
          <Avstand marginBottom={12} />
          {visFlereDeler ? (
            <>
              <LeggTilDel
                hjelpemiddel={{
                  ...handlekurv.hjelpemiddel,
                  // Filtrer bort deler som allerede er lagt til
                  deler: handlekurv.hjelpemiddel.deler?.filter(
                    (del) => !handlekurv.deler.find((handlekurvDel) => handlekurvDel.hmsnr === del.hmsnr)
                  ),
                }}
                onLeggTil={(del) => leggTilDel(del)}
              />
            </>
          ) : (
            <>
              <Avstand marginBottom={8}>
                <Heading level="2" size="large" spacing id="deler">
                  Deler lagt til i bestillingen
                </Heading>
                {handlekurv.deler.length === 0 && <div>Du har ikke lagt til noen deler</div>}
                {handlekurv.deler.map((del) => (
                  <Avstand marginBottom={2} key={del.hmsnr}>
                    <Panel border>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        <div style={{ padding: 70, background: '#ececec' }}>[img]</div>
                        <div>
                          <Heading level="3" size="medium" spacing>
                            {del.navn}
                          </Heading>
                          <BodyShort spacing>{del.beskrivelse}</BodyShort>
                          <BodyShort>
                            HMS-nr: {del.hmsnr} | Lev.art.nr: {del.levArtNr}
                          </BodyShort>
                        </div>
                      </div>
                      <Toolbar>
                        <Button icon={<TrashIcon />} variant="tertiary" onClick={() => handleSlettDel(del)}>
                          Slett del
                        </Button>
                        <Select
                          label="Antall"
                          value={del.antall}
                          onChange={(e) => setAntall(del, Number(e.target.value))}
                          style={{ width: 80 }}
                        >
                          {Array.from(Array(5), (_, x: number) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Select>
                      </Toolbar>
                    </Panel>
                  </Avstand>
                ))}
                <Avstand marginBottom={4} />
                <Button variant="secondary" onClick={() => setVisFlereDeler(true)}>
                  Legg til flere deler
                </Button>
              </Avstand>
              <Avstand marginBottom={8}>
                <Heading spacing level="3" size="medium">
                  Levering
                </Heading>
                {!delbestillerRolle.harXKLager && (
                  <Alert variant="info">
                    Delen blir levert til kommunens mottakssted. Innbyggers navn vil stå på pakken med delen.
                  </Alert>
                )}
                {delbestillerRolle.harXKLager && (
                  <>
                    <RadioGroup
                      id="levering"
                      legend="Hvor skal delen plasseres når den har blitt levert til kommunen?"
                      value={handlekurv.levering ?? ''}
                      onChange={(levering: Levering) => setLevering(levering)}
                      error={!!valideringsFeil.find((feil) => feil.id === 'levering')}
                    >
                      <Radio value={Levering.TIL_XK_LAGER}>Delen skal legges på XK-lager.</Radio>
                      <Radio value={Levering.TIL_SERVICE_OPPDRAG}>Delen skal brukes i serviceoppdrag hos bruker.</Radio>
                    </RadioGroup>
                  </>
                )}
              </Avstand>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <Button loading={senderInnBestilling} onClick={() => sendInnBestilling(handlekurv)}>
                  Send inn bestilling
                </Button>
                <Button icon={<TrashIcon />} variant="tertiary" onClick={slettBestilling}>
                  Slett bestilling
                </Button>
              </div>
              {valideringsFeil.length > 0 && <Errors valideringsFeil={valideringsFeil} />}
              {feilmelding && (
                <Alert variant="error">
                  <>
                    {feilmelding.melding}
                    {feilmelding.stack && (
                      <Avstand marginTop={4}>
                        <ExpansionCard size="small" aria-label="informasjon for utviklere">
                          <ExpansionCard.Header>
                            <ExpansionCard.Title>Informasjon for utviklere</ExpansionCard.Title>
                          </ExpansionCard.Header>
                          <ExpansionCard.Content>{JSON.stringify(feilmelding.stack)}</ExpansionCard.Content>
                        </ExpansionCard>
                      </Avstand>
                    )}
                  </>
                </Alert>
              )}
            </>
          )}
        </>
      </Content>
      {(window.appSettings.USE_MSW || window.appSettings.MILJO === 'dev-gcp') && <Rolleswitcher />}
    </main>
  )
}

export default Utsjekk
