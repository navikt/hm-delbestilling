import { Button, Heading, Loader, ToggleGroup } from '@navikt/ds-react'
import React, { useState, useEffect, useMemo } from 'react'
import rest from '../services/rest'
import {Delbestilling, DelbestillingSak, Valg} from '../types/Types'
import { Avstand } from './Avstand'
import BestillingsKort from './BestillingsKort'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const SakerBanner = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
  gap: 8px;
  align-items: center;
  h2 {
    flex: 1;
  }
`

const LoaderContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  padding: 20px;
`

const ButtonContainer = styled(Avstand)`
  display: flex;
  justify-content: flex-end;
`

interface Props {
  text: string
  maksBestillinger?: number
}

const BestillingsListe = ({ text, maksBestillinger }: Props) => {
  const [tidligereBestillingerForValg, setTidligereBestillingerForValg] = useState<
    Record<Valg, DelbestillingSak[] | undefined>
  >({
    mine: undefined,
    kommunens: undefined,
  })
  const [erLoggetInn, setErLoggetInn] = useState(false)
  const [henterTidligereBestillinger, setHenterTidligereBestillinger] = useState(true)
  const [valg, setValg] = useState<Valg>('mine')
  const navigate = useNavigate()
  const { loginStatus } = useAuth()

  useEffect(() => {
    hentBestillinger(valg)
  }, [valg])

  const hentBestillinger = async (valg: Valg) => {
    console.log(`Henter bestillinger for ${valg}`)

    try {
      const erLoggetInn = await loginStatus()
      if (erLoggetInn) {
        setHenterTidligereBestillinger(true)
        let bestillinger = await rest.hentBestillinger(valg)
        setTidligereBestillingerForValg({
          ...tidligereBestillingerForValg,
          [valg]: bestillinger,
        })
        setErLoggetInn(true)
      } else {
        setErLoggetInn(false)
      }
    } catch (err) {
      console.log(`Klarte ikke hente tidliger bestillinger`, err)
      setTidligereBestillingerForValg({
        ...tidligereBestillingerForValg,
        [valg]: undefined,
      })
    } finally {
      setHenterTidligereBestillinger(false)
    }
  }

  const tidligereBestillinger = useMemo(() => {
    let bestillinger = tidligereBestillingerForValg[valg]
    if (bestillinger) {
      bestillinger = bestillinger.sort((a, b) => b.opprettet.getTime() - a.opprettet.getTime())
      return maksBestillinger ? bestillinger.slice(0, maksBestillinger) : bestillinger
    }
    return undefined
  }, [tidligereBestillingerForValg, valg, maksBestillinger])

  return (
    <>
      <SakerBanner>
        <Heading level="2" size="small">
          {text}
        </Heading>
        {henterTidligereBestillinger && tidligereBestillinger && <Loader size="small" />}
        <ToggleGroup defaultValue="mine" size="small" onChange={(val) => setValg(val as Valg)}>
          <ToggleGroup.Item value="mine">Mine</ToggleGroup.Item>
          <ToggleGroup.Item value="kommunens">Kommunens</ToggleGroup.Item>
        </ToggleGroup>
      </SakerBanner>

      <Avstand marginBottom={4} />
      {tidligereBestillinger && tidligereBestillinger.length > 0 ? (
        <>
          {tidligereBestillinger.map((sak) => (
            <BestillingsKort key={sak.delbestilling.id} delbestilling={sak.delbestilling} />
          ))}
        </>
      ) : henterTidligereBestillinger ? (
        <LoaderContainer>
          <Loader size="2xlarge" />
        </LoaderContainer>
      ) : (
        <div>Ingen tidligere bestillinger</div>
      )}

      {tidligereBestillinger && tidligereBestillinger.length > 0 && maksBestillinger && (
        <ButtonContainer marginTop={4}>
          <Button onClick={() => navigate('/bestillinger')}>Vis alle</Button>
        </ButtonContainer>
      )}
    </>
  )
}

export default BestillingsListe
