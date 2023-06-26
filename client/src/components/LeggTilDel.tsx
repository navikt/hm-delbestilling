import React from 'react'
import { Button, Heading, Panel } from '@navikt/ds-react'
import { Avstand } from '../components/Avstand'
import { Hjelpemiddel, Del } from '../types/Types'
import DelInfo from './DelInfo'
import FlexedStack from '../styledcomponents/FlexedStack'
import useDelKategorier from '../hooks/useDelKategorier'
import DelKategoriVelger from './DelKategoriVelger'
import DelInnhold from './DelInhold'

interface Props {
  hjelpemiddel: Hjelpemiddel
  onLeggTil: (del: Del) => void
  knappeTekst?: string
}
const LeggTilDel = ({ hjelpemiddel, onLeggTil, knappeTekst = 'Legg til del' }: Props) => {
  const { delKategorier, kategoriFilter, setKategoriFilter } = useDelKategorier(hjelpemiddel.deler)

  if (!hjelpemiddel.deler || hjelpemiddel.deler.length === 0) {
    return <div>Dette hjelpemiddelet har ingen deler du kan legge til</div>
  }

  return (
    <>
      <Heading size="medium" level="3" spacing>
        Deler til {hjelpemiddel.navn}
      </Heading>
      <Avstand marginBottom={4}>
        <DelKategoriVelger
          setKategoriFilter={setKategoriFilter}
          delKategorier={delKategorier}
          kategoriFilter={kategoriFilter}
        />
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

                <Button variant="secondary" onClick={() => onLeggTil(del)}>
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
