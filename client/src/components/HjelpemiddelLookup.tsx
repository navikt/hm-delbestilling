import React, { SetStateAction, useState } from 'react'
import { Button, Heading, Panel, TextField } from '@navikt/ds-react'
import { Hjelpemiddel } from '../types/Types'
import styled from 'styled-components'
import rest from '../services/rest'

const erBareTall = (input: string): boolean => {
  return input === '' || /^[0-9]+$/.test(input)
}

const innenforMaksLengde = (input: string): boolean => {
  return input.length <= 6
}

const erGyldig = (input: string) => innenforMaksLengde(input) && erBareTall(input)

const StyledForm = styled.form`
  display: flex;
  gap: 12px;
  align-items: end;

  @media only screen and (max-width: 750px) {
    flex-direction: column;
    align-items: baseline;
  }
`

const StyledTextField = styled(TextField)`
  width: 130px;
`

interface Props {
  artnr: string
  setArtnr: React.Dispatch<SetStateAction<string>>
  serienr: string
  setSerienr: React.Dispatch<SetStateAction<string>>
  setHjelpemiddel: React.Dispatch<SetStateAction<Hjelpemiddel | undefined>>
}
const HjelpemiddelLookup = ({ artnr, setArtnr, serienr, setSerienr, setHjelpemiddel }: Props) => {
  const [gjørOppslag, setGjørOppslag] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setGjørOppslag(true)
      const oppslag = await rest.hjelpemiddelOppslag(artnr, serienr)

      if (oppslag.serienrKobletMotBruker === false) {
        alert(`Vi klarte ikke å koble serienr ${serienr} til en bruker`)
      } else {
        setHjelpemiddel(oppslag.hjelpemiddel)
      }
    } catch (err) {
      alert(`Klarte ikke å hente hjelpemiddel med artikkelnr ${artnr} og serienr ${serienr}`)
      console.log(`Kunne ikke hente hjelpemiddel`, err)
    } finally {
      setGjørOppslag(false)
    }
  }

  const reset = () => {
    setArtnr('')
    setSerienr('')
  }

  return (
    <Panel>
      <Heading size="xsmall" level="3" spacing>
        Oppgi hjelpemiddelet som trenger del
      </Heading>

      <StyledForm onSubmit={handleSubmit}>
        <StyledTextField
          label="Art.nr(6 siffer)"
          value={artnr}
          onChange={(e) => erGyldig(e.target.value) && setArtnr(e.target.value)}
        />
        <StyledTextField
          label="Serienr(6 siffer)"
          value={serienr}
          onChange={(e) => erGyldig(e.target.value) && setSerienr(e.target.value)}
        />
        <Button loading={gjørOppslag} onClick={handleSubmit}>
          Vis deler
        </Button>
        <Button type="button" onClick={reset} variant="tertiary">
          Start på nytt
        </Button>
      </StyledForm>
    </Panel>
  )
}

export default HjelpemiddelLookup
