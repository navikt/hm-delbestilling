import { BodyShort, Button, Heading, Panel } from '@navikt/ds-react'
import React, { useEffect, useState } from 'react'
import { Avstand } from '../components/Avstand'
import Content from '../styledcomponents/Content'
import Header from '../styledcomponents/Header'
import { Del, Handlekurv, Hjelpemiddel } from '../types/Types'

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
              {session.hjelpemiddel.deler?.map((del) => {
                const harDelIHandlekurv = session.handlekurv.deler.find(
                  (handlekurvDel) => handlekurvDel.hmsnr === del.hmsnr
                )

                if (harDelIHandlekurv) return null

                return (
                  <Avstand marginBottom={4} key={del.hmsnr}>
                    <Panel>
                      <Heading size="xsmall" level="4">
                        {del.navn}
                      </Heading>
                      <BodyShort spacing>{del.beskrivelse}</BodyShort>
                      <Button variant="secondary" onClick={() => leggTilDel(del)}>
                        Legg til
                      </Button>
                    </Panel>
                  </Avstand>
                )
              })}
            </>
          ) : (
            <>
              <Heading level="2" size="large" spacing>
                Deler lagt til i bestillingen
              </Heading>
              {session.handlekurv.deler.map((del) => (
                <Panel key={del.hmsnr} border>
                  <Heading level="3" size="medium">
                    {del.navn}
                  </Heading>
                  <BodyShort spacing>{del.beskrivelse}</BodyShort>
                  <div style={{ padding: '1rem', background: '#f1f1f1' }}></div>
                </Panel>
              ))}
            </>
          )}

          <Button onClick={() => setVisFlereDeler(!visFlereDeler)}>Legg til flere deler</Button>
        </Content>
      </main>
    </>
  )
}

export default Utsjekk
