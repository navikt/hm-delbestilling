import { Hjelpemiddel } from '../types/Types'
import React, { Dispatch, SetStateAction } from 'react'
import { BodyShort, Heading, Panel } from '@navikt/ds-react'
import { Avstand } from './Avstand'
import { ArrowRightIcon } from '@navikt/aksel-icons'

interface Props {
  hjelpemiddel: Hjelpemiddel
  aktiv: boolean
  setAktivtHjelpemiddel: Dispatch<SetStateAction<Hjelpemiddel | undefined>>
}

const HjelpemiddelKnapp = (props: Props) => {
  const { hjelpemiddel, aktiv, setAktivtHjelpemiddel } = props
  const { hmsnr, navn } = hjelpemiddel
  return (
    <>
      <Panel border={aktiv} onClick={() => setAktivtHjelpemiddel(hjelpemiddel)}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ alignItems: 'flex-end', justifyContent: 'space-between', flexDirection: 'column' }}>
            <Heading size="xsmall" level="4" spacing>
              {navn}
            </Heading>
            <BodyShort>
              <strong>Art.nr:</strong> {hmsnr}
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