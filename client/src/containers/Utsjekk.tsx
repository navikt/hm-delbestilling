import React, { useState } from 'react'
import { Alert, BodyShort, Button, ExpansionCard, Heading, Panel, Select } from '@navikt/ds-react'
import { Avstand } from '../components/Avstand'
import LeggTilDel from '../components/LeggTilDel'
import Content from '../styledcomponents/Content'
import { Del, Delbestilling, Handlekurv } from '../types/Types'
import { DelbestillingFeil } from '../types/HttpTypes'
import { TrashIcon, ArrowLeftIcon } from '@navikt/aksel-icons'
import { useNavigate } from 'react-router-dom'
import { LOCALSTORAGE_HANDLEKURV_KEY } from './Index'
import styled from 'styled-components'
import rest from '../services/rest'
import { useRolleContext } from '../context/rolle'

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
  const [feilmelding, setFeilmelding] = useState<Feilmelding | undefined>()
  const navigate = useNavigate()

  const [senderInnBestilling, setSenderInnBestilling] = useState(false)

  const leggTilDel = (del: Del) => {
    setHandlekurv((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        deler: [...prev.deler, { ...del, antall: 1 }],
      }
    })

    setVisFlereDeler(false)
  }

  const setAntall = (del: Del, antall: number) => {
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

  const handleSlettDel = (del: Del) => {
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

  const hentInnsendingFeil = (innsendingFeil: DelbestillingFeil): string => {
    switch (innsendingFeil) {
      case DelbestillingFeil.ULIK_GEOGRAFISK_TILKNYTNING:
        return 'Du kan ikke bestille deler til bruker som ikke tilhører den kommunen du jobber i'
      case DelbestillingFeil.INGET_UTLÅN:
        return 'Det finnes ikke noe utlån for denne brukeren på dette artikkel- og serienummer'
      default:
        return 'Ukjent feil'
    }
  }

  const sendInnBestilling = async (handlekurv: Handlekurv) => {
    setFeilmelding(undefined)
    if (handlekurv.deler.length === 0) {
      setFeilmelding({ melding: 'Du kan ikke sende inn bestilling med 0 deler' })
      return
    }

    try {
      setSenderInnBestilling(true)
      const delbestilling: Delbestilling = {
        id: handlekurv.id,
        hmsnr: handlekurv.hjelpemiddel.hmsnr,
        serienr: handlekurv.serienr,
        deler: handlekurv.deler,
      }
      const response = await rest.sendInnBestilling(delbestilling)
      if (response.feil) {
        // TODO: log feil til Amplitude
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
    window.localStorage.removeItem(LOCALSTORAGE_HANDLEKURV_KEY)
    navigate('/')
    window.scrollTo(0, 0)
  }

  if (!handlekurv) {
    return <>Fant ingen handlekurv...</>
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
                <Heading level="2" size="large" spacing>
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
                <div>TODO: implementer</div>
                {delbestillerRolle.harXKLager && <div>TODO: XK-lager</div>}
              </Avstand>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <Button loading={senderInnBestilling} onClick={() => sendInnBestilling(handlekurv)}>
                  Send inn bestilling
                </Button>
                <Button icon={<TrashIcon />} variant="tertiary" onClick={slettBestilling}>
                  Slett bestilling
                </Button>
              </div>

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
    </main>
  )
}

export default Utsjekk
