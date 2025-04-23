import React, { SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Button, Heading, TextField } from '@navikt/ds-react'

import rest from '../services/rest'
import { CustomPanel } from '../styledcomponents/CustomPanel'
import { OppslagFeil, Pilot } from '../types/HttpTypes'
import { Hjelpemiddel } from '../types/Types'
import { logOppslagFeil, logOppslagGjort } from '../utils/amplitude'

import { Avstand } from './Avstand'
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
  onOppslagSuksess: (hjelpemiddel: Hjelpemiddel | undefined, piloter: Pilot[]) => void
}

const HjelpemiddelLookup = ({ hmsnr, setHmsnr, serienr, setSerienr, onOppslagSuksess }: Props) => {
  const { t } = useTranslation()
  const [gjørOppslag, setGjørOppslag] = useState(false)
  const [feilmelding, setFeilmelding] = useState<FeilmeldingInterface | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (hmsnr.length !== 6 || serienr.length !== 6) {
      setFeilmelding({
        feilmelding: t('error.artnrOgSerienr6Siffer'),
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
          feilmelding: t(`oppslagfeil.${oppslag.feil}`),
          variant: oppslag.feil === OppslagFeil.INGET_UTLÅN ? 'error' : 'warning',
        })
        logOppslagFeil(oppslag.feil, hmsnr)
      } else {
        onOppslagSuksess(oppslag.hjelpemiddel, oppslag.piloter)
      }
    } catch (err: any) {
      console.log(`Kunne ikke hente hjelpemiddel`, err)
      logOppslagFeil('FEIL_FRA_BACKEND', hmsnr, err.statusCode)
      let feilmelding = ''
      if (err.isTooManyRequests()) {
        feilmelding = t('error.forMangeOppslag')
      } else {
        feilmelding = t('error.noeGikkGalt')
      }
      setFeilmelding({
        feilmelding,
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
    <CustomPanel border>
      <Heading size="xsmall" level="2">
        {t('oppslag.hvilketHjelpemiddel')}
      </Heading>
      <Avstand marginBottom={8} />

      <StyledForm onSubmit={handleSubmit}>
        <StyledTextField
          label={t('oppslag.artnr')}
          value={hmsnr}
          onChange={(e) => erGyldig(e.target.value) && setHmsnr(e.target.value)}
          data-cy="input-artnr"
        />
        <StyledTextField
          label={t('oppslag.serienr')}
          value={serienr}
          onChange={(e) => erGyldig(e.target.value) && setSerienr(e.target.value)}
          data-cy="input-serienr"
        />
        <Button loading={gjørOppslag} onClick={handleSubmit} data-cy="button-oppslag-submit">
          {t('oppslag.visDeler')}
        </Button>
        <Button type="button" onClick={reset} variant="tertiary" data-cy="button-oppslag-reset">
          {t('oppslag.startPåNytt')}
        </Button>
      </StyledForm>

      {feilmelding && !gjørOppslag && (
        <Avstand marginTop={4}>
          <Feilmelding feilmelding={feilmelding} />
        </Avstand>
      )}
    </CustomPanel>
  )
}

export default HjelpemiddelLookup
