import { BodyShort, Button, Heading, Loader, Panel, Select } from '@navikt/ds-react'
import React, { useEffect, useState } from 'react'
import { Avstand } from '../components/Avstand'
import LeggTilDel from '../components/LeggTilDel'
import Content from '../styledcomponents/Content'
import Header from '../styledcomponents/Header'
import { Bestilling, Del, InnsendtBestilling } from '../types/Types'
import { TrashIcon, ArrowLeftIcon } from '@navikt/aksel-icons'
import { useNavigate } from 'react-router-dom'
import { LOCALSTORAGE_BESTILLING_KEY } from './Index'
import useAuth from '../hooks/useAuth'
import { DelbestillerResponse } from '../types/ResponseTypes'
import styled from 'styled-components'
import rest from '../services/rest'

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

const Utsjekk = () => {
  const [bestilling, setBestilling] = useState<Bestilling | undefined>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(LOCALSTORAGE_BESTILLING_KEY) || '')
    } catch {
      return undefined
    }
  })
  const [visFlereDeler, setVisFlereDeler] = useState(false)
  const navigate = useNavigate()

  const { rolle } = useAuth()
  const [henterRolle, setHenterRolle] = useState(true)
  const [rolleResponse, setRolleResponse] = useState<DelbestillerResponse | undefined>(undefined)
  const [senderInnBestilling, setSenderInnBestilling] = useState(false)

  useEffect(() => {
    const doFetch = async () => {
      const delbestiller = await rolle()
      setRolleResponse(delbestiller)
      setHenterRolle(false)
    }
    doFetch()
  }, [])

  console.log('bestilling:', bestilling)

  const leggTilDel = (del: Del) => {
    if (!bestilling) return

    setBestilling((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        handlekurv: {
          ...prev.handlekurv,
          deler: [...prev.handlekurv.deler, { ...del, antall: 1 }],
        },
      }
    })

    setVisFlereDeler(false)
  }

  const setAntall = (del: Del, antall: number) => {
    setBestilling((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        handlekurv: {
          ...prev.handlekurv,
          deler: prev.handlekurv.deler.map((handlekurvDel) => {
            if (handlekurvDel.hmsnr === del.hmsnr) return { ...handlekurvDel, antall: antall }
            return handlekurvDel
          }),
        },
      }
    })
  }

  const handleSlettDel = (del: Del) => {
    setBestilling((prev) => {
      if (!prev) return undefined
      return {
        ...prev,
        handlekurv: {
          ...prev.handlekurv,
          deler: prev.handlekurv.deler.filter((handlekurvDel) => {
            return handlekurvDel.hmsnr !== del.hmsnr
          }),
        },
      }
    })
  }

  const handleSendInnBestilling = async (bestilling: Bestilling) => {
    try {
      setSenderInnBestilling(true)
      const innsendtBestilling: InnsendtBestilling = {
        id: bestilling.id,
        hmsnr: bestilling.hjelpemiddel.hmsnr,
        serienr: bestilling.handlekurv.serienr,
        deler: bestilling.handlekurv.deler,
      }
      await rest.sendInnBestilling(innsendtBestilling)
      alert('Bestilling sendt inn!')
      handleSlettBestilling()
    } catch (err) {
      alert(`Noe gikk gærent med innsending, se konsoll`)
      console.log(err)
    } finally {
      setSenderInnBestilling(false)
    }
  }

  const handleSlettBestilling = () => {
    window.localStorage.removeItem(LOCALSTORAGE_BESTILLING_KEY)
    navigate('/')
    window.scrollTo(0, 0)
  }

  if (!bestilling) {
    return <>Fant ingen bestilling...</>
  }

  return (
    <>
      <Header>
        <Content>
          <Heading level="1" size="xlarge">
            Bestill del til hjelpemiddel
          </Heading>
        </Content>
      </Header>
      <main style={{ background: 'white' }}>
        <Content>
          {henterRolle ? (
            <div style={{ textAlign: 'center' }}>
              <Loader size="large" />
            </div>
          ) : (
            <>
              {rolleResponse && rolleResponse.kanBestilleDeler === false ? (
                <div>Du kan ikke bestille deler akkurat nå</div>
              ) : (
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
                      Bestill deler til {bestilling.hjelpemiddel.navn}
                    </Heading>
                    <BodyShort>
                      <strong>Art.nr:</strong> {bestilling.hjelpemiddel.hmsnr} | <strong>Serienr:</strong>{' '}
                      {bestilling.handlekurv.serienr}
                    </BodyShort>
                  </Panel>
                  <Avstand marginBottom={12} />
                  {visFlereDeler ? (
                    <>
                      <LeggTilDel
                        hjelpemiddel={{
                          ...bestilling.hjelpemiddel,
                          // Filtrer bort deler som allerede er lagt til
                          deler: bestilling.hjelpemiddel.deler?.filter(
                            (del) =>
                              !bestilling.handlekurv.deler.find((handlekurvDel) => handlekurvDel.hmsnr === del.hmsnr)
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
                        {bestilling.handlekurv.deler.length === 0 && <div>Du har ikke lagt til noen deler</div>}
                        {bestilling.handlekurv.deler.map((del) => (
                          <Avstand marginBottom={2} key={del.hmsnr}>
                            <Panel border>
                              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                <div style={{ padding: 70, background: '#ececec' }}>[img]</div>

                                <div>
                                  <Heading level="3" size="medium" spacing>
                                    {del.navn}
                                  </Heading>
                                  <BodyShort spacing>{del.beskrivelse}</BodyShort>
                                  <BodyShort>HMS-nr: 154312 | Lev.art.nr: 123454</BodyShort>
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
                      </Avstand>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <Button loading={senderInnBestilling} onClick={() => handleSendInnBestilling(bestilling)}>
                          Send inn bestilling
                        </Button>
                        <Button icon={<TrashIcon />} variant="tertiary" onClick={handleSlettBestilling}>
                          Slett bestilling
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </Content>
      </main>
    </>
  )
}

export default Utsjekk
