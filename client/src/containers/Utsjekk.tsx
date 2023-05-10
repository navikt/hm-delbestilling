import { BodyShort, Button, Heading, Panel, Select } from '@navikt/ds-react'
import React, { useEffect, useState } from 'react'
import { Avstand } from '../components/Avstand'
import LeggTilDel from '../components/LeggTilDel'
import Content from '../styledcomponents/Content'
import Header from '../styledcomponents/Header'
import { Del, Handlekurv, Hjelpemiddel } from '../types/Types'
import { TrashIcon } from '@navikt/aksel-icons'

interface Session {
  handlekurv: Handlekurv
  hjelpemiddel: Hjelpemiddel
}

const Utsjekk = () => {
  const [session, setSession] = useState<Session | undefined>(
    JSON.parse(window.localStorage.getItem('hm-delbestilling-session') ?? '') || undefined
  )
  const [visFlereDeler, setVisFlereDeler] = useState(false)

  console.log('session:', session)

  const leggTilDel = (del: Del) => {
    if (!session) return

    setSession((prev) => {
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
    setSession((prev) => {
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

  const handleSlett = (del: Del) => {
    setSession((prev) => {
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

  if (!session) {
    return <>Fant ingen session...</>
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
              Bestill deler til {session.hjelpemiddel.navn}
            </Heading>
            <BodyShort>
              <strong>Art.nr:</strong> {session.hjelpemiddel.hmsnr} | <strong>Serienr:</strong>{' '}
              {session.handlekurv.serieNr}
            </BodyShort>
          </Panel>
          <Avstand marginBottom={4} />
          {visFlereDeler ? (
            <>
              <LeggTilDel
                hjelpemiddel={{
                  ...session.hjelpemiddel,
                  // Filtrer bort allerede lagt til deler
                  deler: session.hjelpemiddel.deler?.filter(
                    (del) => !session.handlekurv.deler.find((handlekurvDel) => handlekurvDel.hmsnr === del.hmsnr)
                  ),
                }}
                onLeggTil={(del) => leggTilDel(del)}
              />
            </>
          ) : (
            <>
              <Heading level="2" size="large" spacing>
                Deler lagt til i bestillingen
              </Heading>
              {session.handlekurv.deler.length === 0 && <div>Du har ikke lagt til noen deler</div>}
              {session.handlekurv.deler.map((del) => (
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
                    <Button icon={<TrashIcon />} variant="tertiary" onClick={() => handleSlett(del)}>
                      Slett del
                    </Button>
                    <Select label="Antall" value={del.antall} onChange={(e) => setAntall(del, Number(e.target.value))}>
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
            </>
          )}
        </Content>
      </main>
    </>
  )
}

export default Utsjekk
