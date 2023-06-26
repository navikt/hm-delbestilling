import { HjelpemiddelKategori } from '../types/Types'
import React, { Dispatch, SetStateAction } from 'react'
import { BodyShort, Heading, Panel } from '@navikt/ds-react'
import { Avstand } from './Avstand'
import { ArrowRightIcon } from '@navikt/aksel-icons'

interface Props {
  hjelpemiddel: HjelpemiddelKategori
  aktiv: boolean
  setAktivtHjelpemiddel: Dispatch<SetStateAction<HjelpemiddelKategori | undefined>>
}

const HjelpemiddelKnapp = (props: Props) => {
  const { hjelpemiddel, aktiv, setAktivtHjelpemiddel } = props
  const { navn, antallTilgjengeligeDeler } = hjelpemiddel
  return (
    <>
      <Panel border={aktiv} onClick={() => setAktivtHjelpemiddel(hjelpemiddel)}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ alignItems: 'flex-end', justifyContent: 'space-between', flexDirection: 'column', flex: 1 }}>
            <Heading size="xsmall" level="4" spacing>
              {navn}
            </Heading>
            <BodyShort>
              <strong>Antall deler:</strong> {antallTilgjengeligeDeler}
            </BodyShort>
          </div>
          <Avstand marginLeft={2} />
          <ArrowRightIcon fontSize={48} />
        </div>
      </Panel>
      <Avstand marginBottom={4} />
    </>
  )
}

export default HjelpemiddelKnapp