import React, { SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Heading, Stack, TextField } from '@navikt/ds-react'

import rest from '../services/rest'
import { OppslagFeil } from '../types/HttpTypes'
import { HjelpemiddelV2, Pilot } from '../types/Types'
import { logOppslagFeil, logOppslagGjort } from '../utils/analytics/analytics'

import { CustomBox } from './Layout/CustomBox'
import { Avstand } from './Avstand'
import { Feilmelding, FeilmeldingInterface } from './Feilmelding'

const erBareTall = (input: string): boolean => {
  return input === '' || /^[0-9]+$/.test(input)
}

const innenforMaksLengde = (input: string, maksLengde: number): boolean => {
  return input.length <= maksLengde
}

const erGyldig = (input: string, maksLengde: number = 6) => innenforMaksLengde(input, maksLengde) && erBareTall(input)

interface Props {
  hmsnr: string
  setHmsnr: React.Dispatch<SetStateAction<string>>
  onOppslagSuksess: (hjelpemiddel: HjelpemiddelV2 | undefined) => void
}

const HjelpemiddelLookup = ({ hmsnr, setHmsnr, onOppslagSuksess }: Props) => {
  const { t } = useTranslation()
  const [gjørOppslag, setGjørOppslag] = useState(false)
  const [feilmelding, setFeilmelding] = useState<FeilmeldingInterface | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (hmsnr.length !== 6 ) {
      setFeilmelding({
        feilmelding: t('error.artnr6Siffer'),
        status: 'warning',
      })
      return
    }

    try {
      setGjørOppslag(true)
      logOppslagGjort(hmsnr)
      const oppslag = await rest.hjelpemiddelOppslag(hmsnr)

      if (oppslag.feil) {
        setFeilmelding({
          feilmelding: t(`oppslagfeil.${oppslag.feil}`),
          status: oppslag.feil === OppslagFeil.INGET_UTLÅN ? 'error' : 'warning',
        })
        logOppslagFeil(oppslag.feil, hmsnr)
      } else {
        onOppslagSuksess(oppslag.hjelpemiddel)
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
  }

  return (
    <CustomBox>
      <Heading size="small" level="2" spacing>
        {t('oppslag.hvilketHjelpemiddel')}
      </Heading>

      <form onSubmit={handleSubmit}>
        <Stack gap="space-12" align={{ xs: 'baseline', md: 'end' }} direction={{ xs: 'column', md: 'row' }}>
          <TextField
            style={{ width: '120px' }}
            label={t('oppslag.artnr')}
            value={hmsnr}
            onChange={(e) => erGyldig(e.target.value) && setHmsnr(e.target.value)}
            data-testid="input-artnr"
          />
          <Button loading={gjørOppslag} onClick={handleSubmit} data-testid="button-oppslag-submit">
            {t('oppslag.visDeler')}
          </Button>
          <Button type="button" onClick={reset} variant="tertiary" data-testid="button-oppslag-reset">
            {t('oppslag.startPåNytt')}
          </Button>
        </Stack>
      </form>

      {feilmelding && !gjørOppslag && (
        <Avstand marginTop={16}>
          <Feilmelding feilmelding={feilmelding} />
        </Avstand>
      )}
    </CustomBox>
  )
}

export default HjelpemiddelLookup
