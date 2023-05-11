import React, { SetStateAction, useState } from 'react'
import { Button, Heading, Panel, TextField } from '@navikt/ds-react'
import { Hjelpemiddel } from '../types/Types'
import styled from 'styled-components'

const erBareTall = (input: string): boolean => {
  return input === '' || /^[0-9]+$/.test(input)
}

const innenforMaksLengde = (input: string): boolean => {
  return input.length <= 6
}

const erGyldig = (input: string) => innenforMaksLengde(input) && erBareTall(input)

export interface OppslagResponse {
  hjelpemiddel?: Hjelpemiddel
  serieNrKobletMotBruker: boolean
}

const StyledTextField = styled(TextField)`
  width: 130px;
`

interface Props {
  artNr: string
  setArtNr: React.Dispatch<SetStateAction<string>>
  serieNr: string
  setSerieNr: React.Dispatch<SetStateAction<string>>
  setHjelpemiddel: React.Dispatch<SetStateAction<Hjelpemiddel | undefined>>
}
const HjelpemiddelLookup = ({ artNr, setArtNr, serieNr, setSerieNr, setHjelpemiddel }: Props) => {
  const [henterHjelpemiddel, setHenterHjelpemiddel] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const doFetch = async () => {
      try {
        setHenterHjelpemiddel(true)
        const result = await fetch('/hjelpemidler/delbestilling/api/oppslag', {
          // const result = await fetch('/api/oppslag', {
          body: JSON.stringify({ artNr, serieNr }),
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const json: OppslagResponse = await result.json()

        if (json.serieNrKobletMotBruker == false) {
          alert(`Vi klarte ikke å koble serienr ${serieNr} til en bruker`)
        } else {
          setHjelpemiddel(json.hjelpemiddel)
        }
      } catch (err) {
        alert(`Klarte ikke å hente hjelpemiddel med artikkelnr ${artNr} og serienr ${serieNr}`)
        console.log(`Kunne ikke hente hjelpemiddel`, err)
      } finally {
        setHenterHjelpemiddel(false)
      }
    }

    doFetch()
  }

  const reset = () => {
    setArtNr('')
    setSerieNr('')
  }

  return (
    <Panel>
      <Heading size="xsmall" level="3" spacing>
        Oppgi hjelpemiddelet som trenger del
      </Heading>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'end' }}>
          <StyledTextField
            label="Art.nr(6 siffer)"
            value={artNr}
            onChange={(e) => erGyldig(e.target.value) && setArtNr(e.target.value)}
          ></StyledTextField>
          <StyledTextField
            label="Serienr(6 siffer)"
            value={serieNr}
            onChange={(e) => erGyldig(e.target.value) && setSerieNr(e.target.value)}
          ></StyledTextField>
          <Button loading={henterHjelpemiddel} onClick={handleSubmit}>
            Vis deler
          </Button>
          <Button type="button" onClick={reset} variant="tertiary">
            Start på nytt
          </Button>
        </div>
      </form>
    </Panel>
  )
}

export default HjelpemiddelLookup
