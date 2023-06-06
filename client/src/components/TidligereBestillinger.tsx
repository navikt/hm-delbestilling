import { BodyShort, Heading, Loader, Panel, ToggleGroup } from '@navikt/ds-react'
import React, { useState, useEffect, SetStateAction } from 'react'
import rest from '../services/rest'
import { Delbestilling } from '../types/Types'
import { Avstand } from './Avstand'

type Valg = 'mine' | 'kommunens'

const TidligereBestillinger = () => {
  const [tidligereBestillinger, setTidligereBestillinger] = useState<Delbestilling[] | undefined>(undefined)
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
      setTidligereBestillinger(bestillinger)
    } catch (err) {
      console.log(`Klarte ikke hente tidliger bestillinger`, err)
      setTidligereBestillinger(undefined)
    } finally {
      setHenterTidligereBestillinger(false)
    }
  }

  return (
    <>
      <Heading level="2" size="medium" spacing>
        Tidligere bestillinger
      </Heading>
      <div>
        <ToggleGroup defaultValue="mine" onChange={(val) => setValg(val as Valg)}>
          <ToggleGroup.Item value="mine">Mine</ToggleGroup.Item>
          <ToggleGroup.Item value="kommunens">Kommunens</ToggleGroup.Item>
        </ToggleGroup>

        <Avstand marginBottom={4} />

        {henterTidligereBestillinger ? (
          <Loader />
        ) : tidligereBestillinger && tidligereBestillinger.length > 0 ? (
          <>
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
          </>
        ) : (
          <div>Ingen tidligere bestillinger</div>
        )}
      </div>
    </>
  )
}

export default TidligereBestillinger
