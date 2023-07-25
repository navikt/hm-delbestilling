import { Heading, Loader, ToggleGroup } from '@navikt/ds-react'
import React, { useState, useEffect, useMemo } from 'react'
import rest from '../services/rest'
import { Delbestilling } from '../types/Types'
import { Avstand } from './Avstand'
import BestillingsKort from './BestillingsKort'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

type Valg = 'mine' | 'kommunens'

const SakerBanner = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
  gap: 5px;
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

interface Props {
  text: string
  maksBestillinger?: number
}

const BestillingsListe = ({ text, maksBestillinger }: Props) => {
  const [tidligereBestillingerForValg, setTidligereBestillingerForValg] = useState<
    Record<Valg, Delbestilling[] | undefined>
  >({
    mine: undefined,
    kommunens: undefined,
  })
  const [henterTidligereBestillinger, setHenterTidligereBestillinger] = useState(true)
  const [valg, setValg] = useState<Valg>('mine')

  useEffect(() => {
    hentBestillinger(valg)
  }, [valg])

  const hentBestillinger = async (valg: Valg) => {
    console.log(`Henter bestillinger for ${valg}`)

    try {
      setHenterTidligereBestillinger(true)
      let bestillinger
      if (valg === 'mine') {
        bestillinger = await rest.hentBestillingerForBruker()
      } else if (valg === 'kommunens') {
        bestillinger = await rest.hentBestillingerForKommune()
      }
      setTidligereBestillingerForValg({
        ...tidligereBestillingerForValg,
        [valg]: bestillinger,
      })
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
    const bestillinger = tidligereBestillingerForValg[valg]
    return bestillinger && maksBestillinger ? bestillinger.slice(0, maksBestillinger) : bestillinger
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
          {tidligereBestillinger.map((bestilling) => (
            <BestillingsKort key={bestilling.id} bestilling={bestilling} />
          ))}
        </>
      ) : henterTidligereBestillinger ? (
        <LoaderContainer>
          <Loader size="2xlarge" />
        </LoaderContainer>
      ) : (
        <div>Ingen tidligere bestillinger</div>
      )}
    </>
  )
}

export default BestillingsListe
