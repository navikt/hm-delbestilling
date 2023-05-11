import { BodyShort, Button, Heading, Panel, Select } from '@navikt/ds-react'
import React, { useState } from 'react'
import { Avstand } from '../components/Avstand'
import LeggTilDel from '../components/LeggTilDel'
import Content from '../styledcomponents/Content'
import Header from '../styledcomponents/Header'
import { Bestilling, Del } from '../types/Types'
import { TrashIcon } from '@navikt/aksel-icons'
import { useNavigate } from 'react-router-dom'
import { LOCALSTORAGE_BESTILLING_KEY } from './Index'

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

  const handleSlettBestilling = () => {
    window.localStorage.removeItem(LOCALSTORAGE_BESTILLING_KEY)
    navigate('/')
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
      <main>
        <Content>
          {visFlereDeler && (
            <Avstand marginBottom={2}>
              <Button variant="tertiary" onClick={() => setVisFlereDeler(false)}>
                Tilbake til bestillingen
              </Button>
            </Avstand>
          )}
          <Panel>
            <Heading level="3" size="small" spacing>
              Bestill deler til {bestilling.hjelpemiddel.navn}
            </Heading>
            <BodyShort>
              <strong>Art.nr:</strong> {bestilling.hjelpemiddel.hmsnr} | <strong>Serienr:</strong>{' '}
              {bestilling.handlekurv.serieNr}
            </BodyShort>
          </Panel>
          <Avstand marginBottom={4} />
          {visFlereDeler ? (
            <>
              <LeggTilDel
                hjelpemiddel={{
                  ...bestilling.hjelpemiddel,
                  // Filtrer bort allerede lagt til deler
                  deler: bestilling.hjelpemiddel.deler?.filter(
                    (del) => !bestilling.handlekurv.deler.find((handlekurvDel) => handlekurvDel.hmsnr === del.hmsnr)
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
                  <Panel key={del.hmsnr} border>
                    <Heading level="3" size="medium">
                      {del.navn}
                    </Heading>
                    <BodyShort spacing>{del.beskrivelse}</BodyShort>
                    <div
                      style={{
                        padding: '1rem',
                        background: '#f1f1f1',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Button icon={<TrashIcon />} variant="tertiary" onClick={() => handleSlettDel(del)}>
                        Slett del
                      </Button>
                      <Select
                        label="Antall"
                        value={del.antall}
                        onChange={(e) => setAntall(del, Number(e.target.value))}
                      >
                        {Array.from(Array(5), (_, x: number) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </Panel>
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
                <Button>Send inn bestilling</Button>
                <Button icon={<TrashIcon />} variant="tertiary" onClick={handleSlettBestilling}>
                  Slett bestilling
                </Button>
              </div>
            </>
          )}
        </Content>
      </main>
    </>
  )
}

export default Utsjekk
