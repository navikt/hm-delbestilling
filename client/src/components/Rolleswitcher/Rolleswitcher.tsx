import React, { SetStateAction, useState } from 'react'

import { Box, Button, Checkbox, CheckboxGroup, Detail, Heading, TextField } from '@navikt/ds-react'

import { Pilot } from '../../types/Types'
import { Avstand } from '../Avstand'

import styles from './Rolleswitcher.module.css'

interface Props {
  harXKLager?: boolean | undefined
  setHarXKLager?: React.Dispatch<SetStateAction<boolean | undefined>>
  piloter?: Pilot[]
  setPiloter?: React.Dispatch<SetStateAction<Pilot[]>>
  antallDagerSidenSistBatteribestilling?: number | null
  setAntallDagerSidenSistBatteribestilling?: (antallDager: number | null) => void
}

const Rolleswitcher = ({
  harXKLager,
  setHarXKLager,
  piloter,
  setPiloter,
  antallDagerSidenSistBatteribestilling,
  setAntallDagerSidenSistBatteribestilling,
}: Props) => {
  const [erSkjult, setErSkjult] = useState(false)

  const handleChange = (values: string[]) => {
    if (setHarXKLager !== undefined) {
      setHarXKLager(values.includes('harXKLager'))
    }

    if (setPiloter !== undefined) {
      /*
      if (values.includes(Pilot.BESTILLE_IKKE_FASTE_LAGERVARER)) {
        setPiloter([Pilot.BESTILLE_IKKE_FASTE_LAGERVARER])
      } else {
        setPiloter([])
      }
      */
    }
  }

  const handleSkjul = (skjult: boolean) => {
    setErSkjult(skjult)
  }

  const checkedValues: string[] = []
  if (harXKLager) {
    checkedValues.push('harXKLager')
  }
  /*
  if (piloter?.includes(Pilot.BESTILLE_IKKE_FASTE_LAGERVARER)) {
    checkedValues.push(Pilot.BESTILLE_IKKE_FASTE_LAGERVARER)
  }
  */

  if (erSkjult) {
    return (
      <Box className={styles.wrapper} background="raised">
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            handleSkjul(false)
          }}
          tabIndex={-1}
        >
          Vis Rolleswitcher
        </Button>
      </Box>
    )
  }

  return (
    <Box className={styles.wrapper} background="raised">
      <Button
        style={{ position: 'absolute', top: '7px', right: '7px' }}
        size="small"
        variant="secondary"
        onClick={() => {
          handleSkjul(true)
        }}
        tabIndex={-1}
      >
        -
      </Button>
      <Heading size="xsmall">[DEBUG]</Heading>
      <CheckboxGroup size="small" legend="Roller" hideLegend onChange={handleChange} value={checkedValues}>
        {!!setHarXKLager && <Checkbox value="harXKLager">Har XK-lager</Checkbox>}
        {/* {!!setPiloter && (
          <Checkbox value={Pilot.BESTILLE_IKKE_FASTE_LAGERVARER}>Pilot for bestille ikke-fast lagervare</Checkbox>
        )} */}
      </CheckboxGroup>
      {!!setAntallDagerSidenSistBatteribestilling && (
        <Avstand marginTop={12} marginBottom={12}>
          <TextField
            size="small"
            type="number"
            label="Dager siden sist batteribytte"
            description="Tom = aldri byttet"
            value={antallDagerSidenSistBatteribestilling ?? ''}
            onChange={(e) => {
              const verdi = e.target.value
              setAntallDagerSidenSistBatteribestilling(verdi === '' ? null : Number(verdi))
            }}
          />
        </Avstand>
      )}
      <Detail>Git-commit: {window.appSettings.GIT_COMMIT}</Detail>
    </Box>
  )
}

export default Rolleswitcher
