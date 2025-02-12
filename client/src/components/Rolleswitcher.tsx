import React, { SetStateAction, useState } from 'react'
import styled from 'styled-components'

import { Button, Checkbox, CheckboxGroup, Heading } from '@navikt/ds-react'

import { useRolleContext } from '../context/rolle'

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
  harXKLager: boolean | undefined
  setHarXKLager: React.Dispatch<SetStateAction<boolean | undefined>>
}

const Rolleswitcher = ({ harXKLager, setHarXKLager }: Props) => {
  const [erSkjult, setErSkjult] = useState(false)

  const handleChange = (values: string[]) => {
    setHarXKLager(values.includes('harXKLager'))
  }

  const handleSkjul = (skjult: boolean) => {
    setErSkjult(skjult)
  }

  const checkedValues: string[] = []
  if (harXKLager) {
    checkedValues.push('harXKLager')
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
        <Checkbox value="harXKLager">Har XK-lager</Checkbox>
      </CheckboxGroup>
    </Wrapper>
  )
}

export default Rolleswitcher
