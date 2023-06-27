import { Hjelpemiddel } from '../types/Types'
import React, { Dispatch, SetStateAction } from 'react'
import { BodyShort, Heading, LinkPanel } from '@navikt/ds-react'
import { Avstand } from './Avstand'

interface Props {
  hjelpemiddel: Hjelpemiddel
  aktiv: boolean
  setAktivtHjelpemiddel: Dispatch<SetStateAction<Hjelpemiddel | undefined>>
}

const HjelpemiddelKnapp = ({ hjelpemiddel, aktiv, setAktivtHjelpemiddel }: Props) => {
  const { navn, deler } = hjelpemiddel
  const antallTilgjengeligeDeler = deler?.length || 0
  return (
    <>
      <LinkPanel border={aktiv} onClick={() => setAktivtHjelpemiddel(hjelpemiddel)}>
        <div style={{ alignItems: 'flex-end', justifyContent: 'space-between', flexDirection: 'column', flex: 1 }}>
          <Heading size="xsmall" level="4" spacing>
            {navn}
          </Heading>
          <BodyShort>
            <strong>Antall deler:</strong> {antallTilgjengeligeDeler}
          </BodyShort>
        </div>
      </LinkPanel>
      <Avstand marginBottom={4} />
    </>
  )
}

export default HjelpemiddelKnapp
