import React, { SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Accordion, BodyLong, Button, Heading, HStack, ReadMore, Stack, TextField, VStack } from '@navikt/ds-react'

import rest from '../services/rest'
import { OppslagFeil } from '../types/HttpTypes'
import { HjelpemiddelUtenDeler, Pilot } from '../types/Types'
import { logOppslagFeil, logOppslagGjort } from '../utils/analytics/analytics'

import { CustomBox } from './Layout/CustomBox'
import { Avstand } from './Avstand'
import { Feilmelding, FeilmeldingInterface } from './Feilmelding'
import { erGyldigArtnr, erGyldigBrukernr, erGyldigSerienr } from '../helpers/utils'

interface Props {
  hmsnr: string
  setHmsnr: React.Dispatch<SetStateAction<string>>
  serienr: string
  setSerienr: React.Dispatch<SetStateAction<string>>
  brukernr: string
  setBrukernr: React.Dispatch<SetStateAction<string>>
  onOppslagSuksess: (hjelpemiddel: HjelpemiddelUtenDeler | undefined) => void
  hjelpemiddelUtenDeler: HjelpemiddelUtenDeler | undefined
}

const HjelpemiddelLookup = ({ hmsnr, setHmsnr, serienr, setSerienr, brukernr, setBrukernr, onOppslagSuksess, hjelpemiddelUtenDeler }: Props) => {
  const { t } = useTranslation()
  const [gjørOppslag, setGjørOppslag] = useState(false)
  const [feilmelding, setFeilmelding] = useState<FeilmeldingInterface | undefined>()

  const handleHentDeler = async (hjelpemiddel: HjelpemiddelUtenDeler) => {

    if (hjelpemiddel.erSerienrStyrt) {
      if (serienr.length !== 6) {
        setFeilmelding({
          feilmelding: t('error.serienr'),
          status: 'warning',
        })
        return
      }
    } else {
      if (brukernr.length < 6 || brukernr.length > 8) {
        setFeilmelding({
          feilmelding: t('error.brukernr'),
          status: 'warning',
        })
        return
      }
    }

    if (hmsnr.length !== 6) {
      setFeilmelding({
        feilmelding: t('error.artnr'),
        status: 'warning',
      })
      return
    }

    try {
      setGjørOppslag(true)
      logOppslagGjort(hmsnr)
      const oppslag = await rest.hjelpemiddelOppslag(hmsnr, serienr, brukernr)

      if (oppslag.feil) {
        setFeilmelding({
          feilmelding: t(`oppslagfeil.${oppslag.feil}`),
          status: oppslag.feil === OppslagFeil.INGET_UTLÅN ? 'error' : 'warning',
        })
        logOppslagFeil(oppslag.feil, hmsnr)
      } else {
        // onOppslagSuksess(oppslag.hjelpemiddel) TODO
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

  const handleSlåOppHjelpemiddel = async () => {
    if (hmsnr.length !== 6) {
      setFeilmelding({
        feilmelding: t('error.artnr'),
        status: 'warning',
      })
      return
    }

    try {
      setGjørOppslag(true)
      logOppslagGjort(hmsnr)
      const oppslag = await rest.hjelpemiddelOppslagPåArtNr(hmsnr)

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
    setSerienr('')
  }

  return (
    <CustomBox>
      <Heading size="small" level="2" spacing>
        {t('oppslag.hvilketHjelpemiddel')}
      </Heading>

      <VStack>
        <Stack gap="space-12" align={{ xs: 'baseline', md: 'end' }} direction={{ xs: 'column', md: 'row' }}>
          <TextField
            style={{ width: '120px' }}
            label={t('oppslag.artnr')}
            value={hmsnr}
            onChange={(e) => erGyldigArtnr(e.target.value) && setHmsnr(e.target.value)}
            data-testid="input-artnr"
          />
          <Button loading={gjørOppslag} onClick={handleSlåOppHjelpemiddel} data-testid="button-oppslag-submit">
            {t('oppslag.hjelpemiddel')}
          </Button>
          {/* <Button type="button" onClick={reset} variant="tertiary" data-testid="button-oppslag-reset">
          {t('oppslag.startPåNytt')}
        </Button> */}
        </Stack>

        {hjelpemiddelUtenDeler && (
          <>
            <Avstand marginTop={8} marginBottom={24}>
              <BodyLong>
                {hjelpemiddelUtenDeler.navn}
              </BodyLong>
            </Avstand>

            <Stack gap="space-12" align={{ xs: 'baseline', md: 'end' }} direction={{ xs: 'column', md: 'row' }}>
            {hjelpemiddelUtenDeler.erSerienrStyrt ? (
              <TextField
                style={{ width: '120px' }}
                label={t('oppslag.serienr')}
                value={serienr}
                onChange={(e) => erGyldigSerienr(e.target.value) && setSerienr(e.target.value)}
                data-testid="input-serienr"
              />
            ) : (
              <TextField
                style={{ width: '120px' }}
                label={t('oppslag.brukernr')}
                value={brukernr}
                onChange={(e) => erGyldigBrukernr(e.target.value) && setBrukernr(e.target.value)}
                data-testid="input-brukernr"
              />)}

                <Button loading={gjørOppslag} onClick={() => handleHentDeler(hjelpemiddelUtenDeler)} data-testid="button-oppslag-submit">
                {t('oppslag.hjelpemiddel')}
                </Button>
            </Stack>
    
            <Avstand marginTop={16}>
              <ReadMore header="Slik finner du art.nr, serienr. og brukernr.">
                TODO
              </ReadMore>
            </Avstand>
          </>
        )}

      </VStack>

      {feilmelding && !gjørOppslag && (
        <Avstand marginTop={16}>
          <Feilmelding feilmelding={feilmelding} />
        </Avstand>
      )}
    </CustomBox>
  )
}

export default HjelpemiddelLookup
