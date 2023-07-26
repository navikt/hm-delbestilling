import React, { useState } from 'react'
import { BodyShort, Button, GuidePanel, Heading, Link, Panel } from '@navikt/ds-react'
import { PencilIcon } from '@navikt/aksel-icons'
import HjelpemiddelLookup from '../components/HjelpemiddelLookup'
import Content from '../styledcomponents/Content'
import { Avstand } from '../components/Avstand'
import { Del, Hjelpemiddel, Handlekurv } from '../types/Types'
import { useNavigate } from 'react-router-dom'
import LeggTilDel from '../components/LeggTilDel'
import useAuth from '../hooks/useAuth'
import { v4 as uuidv4 } from 'uuid'
import { CustomPanel } from '../styledcomponents/CustomPanel'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import {CenteredContent} from "../styledcomponents/CenteredContent";

export const SESSIONSTORAGE_HANDLEKURV_KEY = 'hm-delbestilling-handlekurv'

const Index = () => {
  const [hmsnr, setHmsnr] = useState('')
  const [serienr, setSerienr] = useState('')
  const [hjelpemiddel, setHjelpemiddel] = useState<Hjelpemiddel | undefined>(undefined)

  const { loginStatus } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleBestill = async (hjelpemiddel: Hjelpemiddel, del: Del) => {
    const handlekurv: Handlekurv = {
      id: uuidv4(),
      serienr,
      hjelpemiddel,
      deler: [{ del, antall: del.kategori === 'Batteri' ? 2 : 1 }], // Batteri kommer "alltid" i par, så like greit å defaulte til 2
      levering: undefined,
    }

    window.sessionStorage.setItem(SESSIONSTORAGE_HANDLEKURV_KEY, JSON.stringify(handlekurv))

    try {
      const erLoggetInn = await loginStatus()
      if (erLoggetInn) {
        navigate('/utsjekk')
      } else {
        window.location.replace('/hjelpemidler/delbestilling/login')
      }
    } catch (e: any) {
      console.log(e)
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

            {/* 
              <Avstand marginTop={12} />
              <BestillingsListe text={t('bestillinger.dineSiste')} maksBestillinger={2} />
            */}

            <Avstand marginTop={16} />
            <CenteredContent>
              <Button onClick={() => navigate('/bestillinger')} variant="secondary">
                Se tidligere bestillinger
              </Button>
            </CenteredContent>

            <Avstand marginTop={16}>
              <GuidePanel>
                Denne tjenesten er kun for teknikere i kommunen. Som tekniker kan du bestille fra et begrenset utvalg av
                deler til Panthera, Minicrosser, X850, Azalea, Comet, og Orion. Tjenesten er under utvikling av DigiHoT
                - Digitalisering av hjelpemidler og tilrettelegging. Spørsmål og tilbakemeldinger kan du sende på e-post
                til <Link href="mailto:digihot@nav.no">digihot@nav.no</Link>
              </GuidePanel>
            </Avstand>
          </>
        )}
        {hjelpemiddel && (
          <>
            <CustomPanel border>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <Heading size="xsmall" level="4" spacing>
                  Bestilling til {hjelpemiddel.navn}
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
              <BodyShort style={{ display: 'flex', gap: '20px' }}>
                <span>Art.nr. {hmsnr}</span>
                <span>Serienr. {serienr}</span>
              </BodyShort>
            </CustomPanel>
            <Avstand marginBottom={12} />
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
