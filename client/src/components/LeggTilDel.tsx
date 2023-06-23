import React, { useMemo, useState } from 'react'
import { Button, Chips, Heading, Panel } from '@navikt/ds-react'
import { Avstand } from '../components/Avstand'
import { Hjelpemiddel, Del } from '../types/Types'
import { logKategoriFiltreringGjort } from '../utils/amplitude'
import DelInfo from './DelInfo'
import styled from 'styled-components'
import { size } from '../styledcomponents/rules'
import FlexedStack from '../styledcomponents/FlexedStack'

export const DelInnhold = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: ${size.large}) {
    justify-content: space-between;
    align-items: flex-end;
    flex-direction: row;
  }
`

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
              <DelInnhold>
                <FlexedStack>
                  <DelInfo navn={del.navn} hmsnr={del.hmsnr} levArtNr={del.levArtNr} img={del.img} />
                </FlexedStack>

                <Button style={{ minWidth: '130px' }} variant="secondary" onClick={() => onLeggTil(del)}>
                  {knappeTekst}
                </Button>
              </DelInnhold>
            </Panel>
          </Avstand>
        ))}
    </>
  )
}

export default LeggTilDel
