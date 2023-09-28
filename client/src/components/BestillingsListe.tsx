import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { Button, Heading, Loader, ToggleGroup } from '@navikt/ds-react'

import useAuth from '../hooks/useAuth'
import rest from '../services/rest'
import { Del, Delbestilling, DelbestillingSak, Hjelpemiddel, Valg } from '../types/Types'

import { Avstand } from './Avstand'
import BestillingsKort from './BestillingsKort'

const SakerBanner = styled.div`
  display: flex;
  flex-direction: row;
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
      // return maksBestillinger ? bestillinger.slice(0, maksBestillinger) : bestillinger
      return bestillinger
    }
    return undefined
  }, [tidligereBestillingerForValg, valg, maksBestillinger])

  const handleGåTilBestillinger = async () => {
    try {
      const erLoggetInn = await loginStatus()
      if (erLoggetInn) {
        navigate('/bestillinger')
      } else {
        window.location.replace('/hjelpemidler/delbestilling/login?redirect=bestillinger')
      }
    } catch (e: any) {
      console.error(e)
      // TODO: vis feilmelding
      alert('Vi klarte ikke å gå til bestillinger akkurat nå. Prøv igjen senere.')
    }
  }

  return (
    <>
      {/* <SakerBanner>
        {henterTidligereBestillinger && tidligereBestillinger && <Loader size="small" />}
        <ToggleGroup defaultValue="mine" size="small" onChange={(val) => setValg(val as Valg)}>
          <ToggleGroup.Item value="mine">Mine</ToggleGroup.Item>
          <ToggleGroup.Item value="kommunens">Kommunens</ToggleGroup.Item>
        </ToggleGroup>
      </SakerBanner> */}

      {tidligereBestillinger && tidligereBestillinger.length > 0 ? (
        <>
          {tidligereBestillinger.map((sak) => (
            <BestillingsKort key={sak.delbestilling.id} sak={sak} />
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
          <Button onClick={handleGåTilBestillinger}>Vis alle</Button>
        </ButtonContainer>
      )}
    </>
  )
}

export default BestillingsListe
