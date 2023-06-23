import React, { useEffect, useMemo, useState } from 'react'
import rest from '../services/rest'
import { Hjelpemiddel } from '../types/Types'
import { Heading, Label, Pagination, Panel, Search } from '@navikt/ds-react'
import DelKategorier from './DelKategorier'
import useDelKategorier from '../hooks/useDelKategorier'
import Content from '../styledcomponents/Content'
import { Avstand } from './Avstand'
import FlexedStack from '../styledcomponents/FlexedStack'
import DelInfo from './DelInfo'
import { DelInnhold } from './LeggTilDel'
import { useTranslation } from 'react-i18next'
import HjelpemiddelKnapp from './HjelpemiddelKnapp'

function useHjelpemidleListe() {
  const [aktivtHjelpemiddel, setAktivtHjelpemiddel] = useState<Hjelpemiddel | undefined>()
  const [hjelpemidler, setHjelpemidler] = useState<Hjelpemiddel[]>([])
  useEffect(() => {
    rest
      .hentAlleHjelpemidlerMedDeler()
      .then((result) => result.hjelpemidlerMedDeler)
      .then((hjelpemiddelListe) => {
        setHjelpemidler(hjelpemiddelListe)
        setAktivtHjelpemiddel(hjelpemiddelListe[0])
      })
  }, [])
  return { hjelpemidler, aktivtHjelpemiddel, setAktivtHjelpemiddel }
}

function useHjelpemidlerUtvalg(alleHjelpemidler: Hjelpemiddel[], søkeUtrykk: string, maksHjelpemidler: number) {
  const [side, setSide] = useState(1)

  const hjelpemiddelUtvalgEtterSøk = useMemo(() => {
    return søkeUtrykk.length > 0
      ? alleHjelpemidler.filter(({ navn }) => navn.toLowerCase().includes(søkeUtrykk.toLowerCase()))
      : alleHjelpemidler
  }, [søkeUtrykk, alleHjelpemidler])
  const hjelpemidlerUtvalg = useMemo(() => {
    return hjelpemiddelUtvalgEtterSøk.slice((side - 1) * maksHjelpemidler, side * maksHjelpemidler)
  }, [side, søkeUtrykk, alleHjelpemidler])

  const antallSider = useMemo(() => {
    return Math.ceil(hjelpemiddelUtvalgEtterSøk.length / maksHjelpemidler)
  }, [hjelpemiddelUtvalgEtterSøk.length])

  useEffect(() => {
    if (antallSider < side) {
      setSide(Math.max(1, antallSider))
    }
  }, [side, hjelpemiddelUtvalgEtterSøk.length])

  return {
    side,
    setSide,
    antallSider,
    hjelpemidlerUtvalg,
  }
}

interface Props {
  maksHjelpemidler?: number
}

const VisuellOversikt = (props: Props) => {
  const { maksHjelpemidler = 8 } = props
  const { t } = useTranslation()
  const [søkeUtrykk, setSøkeUtrykk] = useState<string>('')
  const { aktivtHjelpemiddel, setAktivtHjelpemiddel, hjelpemidler } = useHjelpemidleListe()
  const { side, setSide, antallSider, hjelpemidlerUtvalg } = useHjelpemidlerUtvalg(
    hjelpemidler,
    søkeUtrykk,
    maksHjelpemidler
  )
  const { setKategoriFilter, kategoriFilter, delKategorier } = useDelKategorier(aktivtHjelpemiddel)
  return (
    <main>
      <Content style={{ width: 1000 }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: 350 }}>
            <Label>{t('visuellOversikt.søkEtterHjelpemiddel')}</Label>
            <Search label="Typesøk" variant="primary" onChange={setSøkeUtrykk} />
            <Avstand paddingBottom={4} />
            {hjelpemidlerUtvalg.map((hjelpemiddel, index) => (
              <HjelpemiddelKnapp
                key={index}
                hjelpemiddel={hjelpemiddel}
                aktiv={hjelpemiddel === aktivtHjelpemiddel}
                setAktivtHjelpemiddel={setAktivtHjelpemiddel}
              />
            ))}
            {antallSider > 1 && (
              <Panel>
                <Pagination
                  size="small"
                  page={side}
                  onPageChange={(x) => setSide(x)}
                  count={antallSider}
                  boundaryCount={1}
                  siblingCount={1}
                />
              </Panel>
            )}
            {hjelpemidlerUtvalg.length == 0 && (
              <Heading level="3" size="small" style={{ padding: '0.5rem' }} role="alert">
                {t('hjelpemidler.sok.ingenTreff')}
              </Heading>
            )}
          </div>
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            <Avstand paddingLeft={4} paddingRight={4} paddingBottom={4}>
              <Heading size="medium" level="3" spacing>
                Deler til {aktivtHjelpemiddel?.navn}
              </Heading>
              <DelKategorier
                setKategoriFilter={setKategoriFilter}
                delKategorier={delKategorier}
                kategoriFilter={kategoriFilter}
              />
              <Avstand paddingBottom={4} />
              {aktivtHjelpemiddel?.deler
                ?.filter((del) => (kategoriFilter ? kategoriFilter === del.kategori : del))
                .map((del) => (
                  <Avstand marginBottom={4} key={del.hmsnr}>
                    <Panel border>
                      <DelInnhold>
                        <FlexedStack>
                          <DelInfo navn={del.navn} hmsnr={del.hmsnr} levArtNr={del.levArtNr} img={del.img} />
                        </FlexedStack>
                      </DelInnhold>
                    </Panel>
                  </Avstand>
                ))}
            </Avstand>
          </div>
        </div>
      </Content>
    </main>
  )
}

export default VisuellOversikt