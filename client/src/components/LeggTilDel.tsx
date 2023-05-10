import React, { useMemo, useState } from 'react'
import { BodyShort, Button, Chips, Heading, Panel } from '@navikt/ds-react'
import { Avstand } from '../components/Avstand'
import { Del, Hjelpemiddel } from '../types/Types'

interface Props {
  hjelpemiddel: Hjelpemiddel
  onLeggTil: (del: Del) => void
  knappeTekst?: string
}
const LeggTilDel = ({ hjelpemiddel, onLeggTil, knappeTekst = 'Legg til del' }: Props) => {
  const [kategoriFilter, setKategoriFilter] = useState<string | undefined>()

  const delKategorier = useMemo(() => {
    if (hjelpemiddel.deler) {
      return hjelpemiddel.deler.reduce((acc, del) => {
        if (!acc.includes(del.kategori)) {
          acc.push(del.kategori)
        }
        return acc
      }, [] as string[])
    }
  }, [hjelpemiddel])

  if (!hjelpemiddel.deler || hjelpemiddel.deler.length === 0) {
    return <div>Dette hjelpemiddelet har ingen deler du kan legge til</div>
  }

  return (
    <>
      <Heading size="medium" level="3" spacing>
        Deler til {hjelpemiddel.navn}
      </Heading>
      <Avstand marginBottom={4}>
        {delKategorier && (
          <Chips>
            <Chips.Toggle
              key={'alleKategorier'}
              selected={kategoriFilter === undefined}
              onClick={() => {
                setKategoriFilter(undefined)
              }}
            >
              Alle deler
            </Chips.Toggle>
            {delKategorier.map((kategori) => (
              <Chips.Toggle
                key={kategori}
                selected={kategoriFilter === kategori}
                onClick={() => {
                  setKategoriFilter(kategori)
                }}
              >
                {kategori}
              </Chips.Toggle>
            ))}
          </Chips>
        )}
      </Avstand>

      {hjelpemiddel.deler
        .filter((del) => (kategoriFilter ? kategoriFilter === del.kategori : del))
        .map((del) => (
          <Avstand marginBottom={4} key={del.hmsnr}>
            <Panel>
              <Heading size="xsmall" level="4">
                {del.navn}
              </Heading>
              <BodyShort spacing>{del.beskrivelse}</BodyShort>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => onLeggTil(del)}>
                  {knappeTekst}
                </Button>
              </div>
            </Panel>
          </Avstand>
        ))}
    </>
  )
}

export default LeggTilDel
