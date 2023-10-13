import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { PrinterSmallIcon } from '@navikt/aksel-icons'
import { Button, Panel, TagProps } from '@navikt/ds-react'

import { DelbestillingSak, Status } from '../types/Types'

import { Avstand } from './Avstand'
import BestillingsOppsummering from './BestillingsOppsummering'

const Toolbar = styled.div`
  padding-top: 16px;
  text-align: right;
`

interface Props {
  sak: DelbestillingSak
}

function tagTypeForStatus(status: Status): TagProps['variant'] {
  switch (status) {
    case 'INNSENDT':
      return 'neutral'
    case 'KLARGJORT':
    case 'REGISTRERT':
      return 'info'
    default:
      return 'info'
  }
}

const BestillingsKort = ({ sak }: Props) => {
  const { t } = useTranslation()
  const etikettType = tagTypeForStatus(sak.status)
  const datoString = sak.opprettet.toLocaleString('no', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  // const { delbestillerrolle } = useRolleContext()
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
