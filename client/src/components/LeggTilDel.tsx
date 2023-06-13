import React, { useMemo, useState } from 'react'
import { BodyShort, Button, Chips, Heading, Panel } from '@navikt/ds-react'
import { Avstand } from '../components/Avstand'
import { HjelpemiddelDel, Hjelpemiddel } from '../types/Types'
import { logKategoriFiltreringGjort } from '../utils/amplitude'

interface Props {
  hjelpemiddel: Hjelpemiddel
  onLeggTil: (del: HjelpemiddelDel) => void
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
              key="alle-deler"
              selected={kategoriFilter === undefined}
              onClick={() => {
                logKategoriFiltreringGjort('alle deler')
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
                  logKategoriFiltreringGjort(kategori)
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
            <Panel border>
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ padding: 70, background: '#ececec' }}>[img]</div>
                <div>
                  <Heading size="small" level="4" spacing>
                    {del.navn}
                  </Heading>
                  {/* <BodyShort spacing>{del.beskrivelse}</BodyShort> */}
                  <BodyShort>
                    HMS-nr: {del.hmsnr} {del.levArtNr && <>| Lev.art.nr: {del.levArtNr}</>}
                  </BodyShort>
                </div>
              </div>
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
