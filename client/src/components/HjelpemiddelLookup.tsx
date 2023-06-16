import React, { SetStateAction, useState } from 'react'
import { Button, Heading, Panel, TextField } from '@navikt/ds-react'
import { Hjelpemiddel } from '../types/Types'
import styled from 'styled-components'
import rest from '../services/rest'
import { OppslagFeil } from '../types/HttpTypes'
import { Avstand } from './Avstand'
import { logOppslagFeil, logOppslagGjort } from '../utils/amplitude'
import { Feilmelding, FeilmeldingInterface } from './Feilmelding'

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
  const [feilmelding, setFeilmelding] = useState<FeilmeldingInterface | undefined>()

  const hentOppslagFeil = (oppslagfeil: OppslagFeil): string => {
    switch (oppslagfeil) {
      case OppslagFeil.INGET_UTLÅN:
        return 'Vi finner dessverre ikke et utlån på dette art.nr og serienr.'
      case OppslagFeil.TILBYR_IKKE_HJELPEMIDDEL:
        return 'Du kan ikke bestille del til dette hjelpemidlet da det ikke er registrert hos oss. Ta kontakt med din hjelpemiddelsentral for hjelp.'
      default:
        return oppslagfeil
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (hmsnr.length !== 6 || serienr.length !== 6) {
      setFeilmelding({
        feilmelding: 'Både art.nr og serienr må inneholde 6 siffer.',
        variant: 'warning',
      })
      return
    }

    try {
      setGjørOppslag(true)
      logOppslagGjort(hmsnr)
      const oppslag = await rest.hjelpemiddelOppslag(hmsnr, serienr)

      if (oppslag.feil) {
        setFeilmelding({
          feilmelding: hentOppslagFeil(oppslag.feil),
          variant: oppslag.feil === OppslagFeil.TILBYR_IKKE_HJELPEMIDDEL ? 'warning' : 'error',
        })
        logOppslagFeil(oppslag.feil, hmsnr)
      } else {
        setHjelpemiddel(oppslag.hjelpemiddel)
      }
    } catch (err: any) {
      console.log(`Kunne ikke hente hjelpemiddel`, err)
      setFeilmelding({
        feilmelding: 'Noe gikk feil med oppslag, prøv igjen senere',
        tekniskFeilmelding: err,
      })
    } finally {
      setGjørOppslag(false)
    }
  }

  const reset = () => {
    setHmsnr('')
    setSerienr('')
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

      {feilmelding && (
        <Avstand marginTop={4}>
          <Feilmelding feilmelding={feilmelding} />
        </Avstand>
      )}
    </Panel>
  )
}

export default HjelpemiddelLookup
