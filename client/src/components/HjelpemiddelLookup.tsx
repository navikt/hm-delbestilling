import React, { SetStateAction, useState } from 'react'
import { Alert, Button, Heading, Panel, TextField } from '@navikt/ds-react'
import { Hjelpemiddel } from '../types/Types'
import styled from 'styled-components'
import rest from '../services/rest'
import { OppslagFeil } from '../types/HttpTypes'
import { Avstand } from './Avstand'
import { logOppslagFeil, logOppslagGjort } from '../utils/amplitude'

const erBareTall = (input: string): boolean => {
  return input === '' || /^[0-9]+$/.test(input)
}

const innenforMaksLengde = (input: string, maksLengde: number): boolean => {
  return input.length <= maksLengde
}

const erGyldig = (input: string, maksLengde: number = 6) => innenforMaksLengde(input, maksLengde) && erBareTall(input)

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
  hmsnr: string
  setHmsnr: React.Dispatch<SetStateAction<string>>
  serienr: string
  setSerienr: React.Dispatch<SetStateAction<string>>
  setHjelpemiddel: React.Dispatch<SetStateAction<Hjelpemiddel | undefined>>
}
const HjelpemiddelLookup = ({ hmsnr, setHmsnr, serienr, setSerienr, setHjelpemiddel }: Props) => {
  const [gjørOppslag, setGjørOppslag] = useState(false)
  const [feil, setFeil] = useState<OppslagFeil | undefined>(undefined)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setGjørOppslag(true)
      logOppslagGjort(hmsnr)
      const oppslag = await rest.hjelpemiddelOppslag(hmsnr, serienr)

      if (oppslag.feil) {
        setFeil(oppslag.feil)
        logOppslagFeil(oppslag.feil, hmsnr)
      } else {
        setHjelpemiddel(oppslag.hjelpemiddel)
      }
    } catch (err) {
      alert(`Klarte ikke å hente hjelpemiddel med artikkelnr ${hmsnr} og serienr ${serienr}`)
      console.log(`Kunne ikke hente hjelpemiddel`, err)
    } finally {
      setGjørOppslag(false)
    }
  }

  const reset = () => {
    setHmsnr('')
    setSerienr('')
    setFeil(undefined)
  }

  return (
    <Panel>
      <Heading size="xsmall" level="3" spacing>
        Oppgi hjelpemiddelet som trenger del
      </Heading>

      <StyledForm onSubmit={handleSubmit}>
        <StyledTextField
          label="Art.nr (6 siffer)"
          value={hmsnr}
          onChange={(e) => erGyldig(e.target.value) && setHmsnr(e.target.value)}
        />
        <StyledTextField
          label="Serienr (6 siffer)"
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

      {feil && (
        <Avstand marginTop={6}>
          {feil === OppslagFeil.TILBYR_IKKE_HJELPEMIDDEL && (
            <Alert variant="warning">
              Du kan ikke bestille del til dette hjelpemidlet da det ikke er registrert hos oss. Ta kontakt med din
              hjelpemiddelsentral for hjelp.
            </Alert>
          )}
          {feil === OppslagFeil.INGET_UTLÅN && (
            <Alert variant="warning">Vi finner dessverre ikke et utlån på dette art.nr og serienr.</Alert>
          )}
        </Avstand>
      )}
    </Panel>
  )
}

export default HjelpemiddelLookup
