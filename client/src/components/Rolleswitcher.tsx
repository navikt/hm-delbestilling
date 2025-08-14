import React, { SetStateAction, useState } from 'react'
import styled from 'styled-components'

import { Button, Checkbox, CheckboxGroup, Detail, Heading } from '@navikt/ds-react'

import { Pilot } from '../types/Types'

const Wrapper = styled.div`
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 999999;
  padding: 20px;
  background: #ececec;
  border: 2px dashed black;
  min-width: 220px;
`

interface Props {
  harXKLager?: boolean | undefined
  setHarXKLager?: React.Dispatch<SetStateAction<boolean | undefined>>
  piloter?: Pilot[]
  setPiloter?: React.Dispatch<SetStateAction<Pilot[]>>
}

const Rolleswitcher = ({ harXKLager, setHarXKLager, piloter, setPiloter }: Props) => {
  const [erSkjult, setErSkjult] = useState(false)

  const handleChange = (values: string[]) => {
    if (setHarXKLager !== undefined) {
      setHarXKLager(values.includes('harXKLager'))
    }

    if (setPiloter !== undefined) {
      if (values.includes(Pilot.BESTILLE_IKKE_FASTE_LAGERVARER)) {
        setPiloter([Pilot.BESTILLE_IKKE_FASTE_LAGERVARER])
      } else {
        setPiloter([])
      }
    }
  }

  const handleSkjul = (skjult: boolean) => {
    setErSkjult(skjult)
  }

  const checkedValues: string[] = []
  if (harXKLager) {
    checkedValues.push('harXKLager')
  }
  if (piloter?.includes(Pilot.BESTILLE_IKKE_FASTE_LAGERVARER)) {
    checkedValues.push(Pilot.BESTILLE_IKKE_FASTE_LAGERVARER)
  }

  if (erSkjult) {
    return (
      <Wrapper>
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
      </Wrapper>
    )
  }

  return (
    <Wrapper>
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
        {!!setPiloter && (
          <Checkbox value={Pilot.BESTILLE_IKKE_FASTE_LAGERVARER}>Pilot for bestille ikke-fast lagervare</Checkbox>
        )}
      </CheckboxGroup>
      <Detail>Git-commit: {window.appSettings.GIT_COMMIT}</Detail>
    </Wrapper>
  )
}

export default Rolleswitcher
