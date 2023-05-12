import React, { useState } from 'react'
import { BodyShort, Button, Heading, Panel } from '@navikt/ds-react'
import { PencilIcon } from '@navikt/aksel-icons'
import HjelpemiddelLookup from '../components/HjelpemiddelLookup'
import Content from '../styledcomponents/Content'
import Header from '../styledcomponents/Header'
import { Avstand } from '../components/Avstand'
import { Del, Hjelpemiddel, Bestilling } from '../types/Types'
import { useNavigate } from 'react-router-dom'
import LeggTilDel from '../components/LeggTilDel'
import useAuth from '../hooks/useAuth'

export const LOCALSTORAGE_BESTILLING_KEY = 'hm-delbestilling-bestilling'

const Index = () => {
  const [artNr, setArtNr] = useState('')
  const [serieNr, setSerieNr] = useState('')
  const [hjelpemiddel, setHjelpemiddel] = useState<Hjelpemiddel | undefined>(undefined)
  const { loginStatus } = useAuth()
  const navigate = useNavigate()

  const handleBestill = async (hjelpemiddel: Hjelpemiddel, del: Del) => {
    const bestilling: Bestilling = {
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
          <Heading level="2" size="medium" spacing>
            Bestill del
          </Heading>
          {!hjelpemiddel && (
            <HjelpemiddelLookup
              artNr={artNr}
              setArtNr={setArtNr}
              serieNr={serieNr}
              setSerieNr={setSerieNr}
              setHjelpemiddel={setHjelpemiddel}
            />
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
