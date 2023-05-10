import React, { useMemo, useState } from 'react'
import { BodyShort, Button, Chips, Heading, Panel } from '@navikt/ds-react'
import { Avstand } from '../components/Avstand'
import { Handlekurv, Del, Hjelpemiddel } from '../types/Types'

interface Props {
  hjelpemiddel: Hjelpemiddel
  onLeggTil: (del: Del) => void
  knappeTekst?: string
}
const LeggTilDel = ({ hjelpemiddel, onLeggTil, knappeTekst = 'Legg til del' }: Props) => {
  const [kategoriFilter, setKategoriFilter] = useState<string | undefined>()

  const delKategorier = useMemo(() => {
    if (hjelpemiddel?.deler) {
      return hjelpemiddel.deler.reduce((acc, del) => {
        if (!acc.includes(del.kategori)) {
          acc.push(del.kategori)
        }
        return acc
      }, [] as string[])
    }
  }, [hjelpemiddel])

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
        ?.filter((del) => (kategoriFilter ? kategoriFilter === del.kategori : del))
        .map((del) => (
          <Avstand marginBottom={4} key={del.hmsnr}>
            <Panel>
              <Heading size="xsmall" level="4">
                {del.navn}
              </Heading>
              <BodyShort spacing>{del.beskrivelse}</BodyShort>
              <Button variant="secondary" onClick={() => onLeggTil(del)}>
                {knappeTekst}
              </Button>
            </Panel>
          </Avstand>
        ))}
    </>
  )
}

export default LeggTilDel
