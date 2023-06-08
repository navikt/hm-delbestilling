import React, { useState } from 'react'
import { BodyShort, Button, Heading, Panel } from '@navikt/ds-react'
import { PencilIcon } from '@navikt/aksel-icons'
import HjelpemiddelLookup from '../components/HjelpemiddelLookup'
import Content from '../styledcomponents/Content'
import { Avstand } from '../components/Avstand'
import { HjelpemiddelDel, Hjelpemiddel, Handlekurv, Levering } from '../types/Types'
import { useNavigate } from 'react-router-dom'
import LeggTilDel from '../components/LeggTilDel'
import useAuth from '../hooks/useAuth'
import { v4 as uuidv4 } from 'uuid'
import TidligereBestillinger from '../components/TidligereBestillinger'

export const LOCALSTORAGE_HANDLEKURV_KEY = 'hm-delbestilling-handlekurv'

const Index = () => {
  const [hmsnr, setHmsnr] = useState('')
  const [serienr, setSerienr] = useState('')
  const [hjelpemiddel, setHjelpemiddel] = useState<Hjelpemiddel | undefined>(undefined)

  const { loginStatus } = useAuth()
  const navigate = useNavigate()

  const handleBestill = async (hjelpemiddel: Hjelpemiddel, del: HjelpemiddelDel) => {
    const handlekurv: Handlekurv = {
      id: uuidv4(),
      serienr,
      hjelpemiddel,
      deler: [{ ...del, antall: 1 }],
      levering: undefined,
    }

    window.localStorage.setItem(LOCALSTORAGE_HANDLEKURV_KEY, JSON.stringify(handlekurv))

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
    <main>
      <Content>
        <Heading level="2" size="large" spacing>
          Bestill del
        </Heading>
        {!hjelpemiddel && (
          <>
            <HjelpemiddelLookup
              hmsnr={hmsnr}
              setHmsnr={setHmsnr}
              serienr={serienr}
              setSerienr={setSerienr}
              setHjelpemiddel={setHjelpemiddel}
            />
            <Avstand marginBottom={8} />
            {/* <TidligereBestillinger /> */}
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
                <strong>Art.nr:</strong> {hmsnr} | <strong>Serienr:</strong> {serienr}
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
  )
}

export default Index
