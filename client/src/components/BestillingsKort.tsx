import React, { useState } from 'react'
import styled from 'styled-components'

import { PrinterSmallIcon } from '@navikt/aksel-icons'
import { Button, Panel } from '@navikt/ds-react'

import { DelbestillingSak } from '../types/Types'

import { Avstand } from './Avstand'
import BestillingsOppsummering from './BestillingsOppsummering'

const Toolbar = styled.div`
  text-align: right;
`

interface Props {
  sak: DelbestillingSak
}

const BestillingsKort = ({ sak }: Props) => {
  const [printErAktiv, setPrintErAktiv] = useState(false)
  return (
    <>
      <Avstand marginBottom={4}>
        <Panel border style={{ position: 'relative' }}>
          <BestillingsOppsummering
            printErAktiv={printErAktiv}
            hjelpemiddel={{
              navn: sak.delbestilling.navn,
              hmsnr: sak.delbestilling.hmsnr,
              serienr: sak.delbestilling.serienr,
            }}
            onClose={() => setPrintErAktiv(false)}
            deler={sak.delbestilling.deler}
            levering={sak.delbestilling.levering}
            opprettet={sak.opprettet}
            saksnummer={sak.saksnummer}
          />
          <Toolbar>
            <Button icon={<PrinterSmallIcon />} variant="tertiary" onClick={() => setPrintErAktiv(true)}>
              Skriv ut
            </Button>
          </Toolbar>
        </Panel>
      </Avstand>
    </>
  )
}

export default BestillingsKort
