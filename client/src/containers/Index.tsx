import React, { useEffect, useState } from 'react'
import { BodyShort, Button, Heading, Panel } from '@navikt/ds-react'
import { PencilIcon } from '@navikt/aksel-icons'
import HjelpemiddelLookup from '../components/HjelpemiddelLookup'
import Content from '../styledcomponents/Content'
import Header from '../styledcomponents/Header'
import { Avstand } from '../components/Avstand'
import { Del, Hjelpemiddel, Bestilling, TidligereBestillinger } from '../types/Types'
import { useNavigate } from 'react-router-dom'
import LeggTilDel from '../components/LeggTilDel'
import useAuth from '../hooks/useAuth'
import { v4 as uuidv4 } from 'uuid'

export const LOCALSTORAGE_BESTILLING_KEY = 'hm-delbestilling-bestilling'

const Index = () => {
  const [artNr, setArtNr] = useState('')
  const [serieNr, setSerieNr] = useState('')
  const [hjelpemiddel, setHjelpemiddel] = useState<Hjelpemiddel | undefined>(undefined)

  const [tidligereBestillinger, setTidligereBestillinger] = useState<TidligereBestillinger[] | undefined>(undefined)

  const { loginStatus } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        const result = await fetch('/hjelpemidler/delbestilling/api/delbestilling')

        const json = await result.json()
        setTidligereBestillinger(json)
      } catch (err) {
        console.log(`Klarte ikke hente tidliger bestillinger`, err)
      }
    })()
  }, [])

  const handleBestill = async (hjelpemiddel: Hjelpemiddel, del: Del) => {
    const bestilling: Bestilling = {
      id: uuidv4(),
      hjelpemiddel,
      handlekurv: {
        serieNr,
        deler: [{ ...del, antall: 1 }],
      },
    }

    window.localStorage.setItem(LOCALSTORAGE_BESTILLING_KEY, JSON.stringify(bestilling))

    try {
      const erLoggetInn = await loginStatus()
      if (erLoggetInn) {
        navigate('/utsjekk')
      } else {
        window.location.replace('/hjelpemidler/delbestilling/login')
      }
    } catch {
      // TODO: vis feilmelding
      alert('Vi klarte ikke å sjekke loginstatus akkurat nå. Prøv igjen senere.')
    }
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
          <Heading level="2" size="large" spacing>
            Bestill del
          </Heading>
          {!hjelpemiddel && (
            <>
              <HjelpemiddelLookup
                artNr={artNr}
                setArtNr={setArtNr}
                serieNr={serieNr}
                setSerieNr={setSerieNr}
                setHjelpemiddel={setHjelpemiddel}
              />
              <Avstand marginBottom={4} />
              {tidligereBestillinger && tidligereBestillinger.length > 0 && (
                <>
                  <Heading level="2" size="medium">
                    Tidligere bestillinger
                  </Heading>
                  <div>
                    {tidligereBestillinger.map((bestilling) => (
                      <Panel key={bestilling.id}>
                        <Heading size="small" level="3">
                          Hmsnr: {bestilling.hmsnr}
                        </Heading>
                        Deler:
                        {bestilling.deler.map((del) => (
                          <div style={{ paddingLeft: 20 }} key={del.hmsnr}>
                            <BodyShort>Navn: {del.navn}</BodyShort>
                            <BodyShort>Antall: {del.antall}</BodyShort>
                          </div>
                        ))}
                      </Panel>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          {hjelpemiddel && (
            <>
              <Panel>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <Heading size="xsmall" level="4" spacing>
                    Bestill del til {hjelpemiddel.navn}
                  </Heading>
                  <Button
                    icon={<PencilIcon />}
                    variant="tertiary"
                    onClick={() => {
                      setHjelpemiddel(undefined)
                    }}
                  >
                    Endre
                  </Button>
                </div>
                <BodyShort>
                  <strong>Art.nr:</strong> {artNr} | <strong>Serienr:</strong> {serieNr}
                </BodyShort>
              </Panel>
              <Avstand marginBottom={8} />
              <LeggTilDel
                hjelpemiddel={hjelpemiddel}
                onLeggTil={(del) => handleBestill(hjelpemiddel, del)}
                knappeTekst="Bestill"
              />
            </>
          )}
        </Content>
      </main>
    </>
  )
}

export default Index
