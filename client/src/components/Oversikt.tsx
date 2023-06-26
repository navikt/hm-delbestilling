import React, { useState } from 'react'
import { Heading, Label, Pagination, Panel, Search } from '@navikt/ds-react'
import DelKategoriVelger from './DelKategoriVelger'
import useDelKategorier from '../hooks/useDelKategorier'
import Content from '../styledcomponents/Content'
import { Avstand } from './Avstand'
import FlexedStack from '../styledcomponents/FlexedStack'
import DelInfo from './DelInfo'
import { useTranslation } from 'react-i18next'
import HjelpemiddelKnapp from './HjelpemiddelKnapp'
import { useHjelpemidleKategori, useHjelpemidlerKategoriUtvalg } from '../hooks/useHjelpemidleKategori'
import DelInnhold from "./DelInhold";

interface Props {
  maksHjelpemidler?: number
}

const Oversikt = (props: Props) => {
  const { maksHjelpemidler = 5 } = props
  const { t } = useTranslation()
  const [søkeUtrykk, setSøkeUtrykk] = useState<string>('')
  const { aktivtHjelpemiddel, setAktivtHjelpemiddel, hjelpemidler } = useHjelpemidleKategori()
  const { side, setSide, antallSider, hjelpemidlerUtvalg } = useHjelpemidlerKategoriUtvalg(
    hjelpemidler,
    søkeUtrykk,
    maksHjelpemidler
  )
  const { setKategoriFilter, kategoriFilter, delKategorier } = useDelKategorier(aktivtHjelpemiddel?.deler)
  const ingenDeler = !!aktivtHjelpemiddel && aktivtHjelpemiddel?.deler?.length === 0
  return (
    <main>
      <Content style={{ width: 1000 }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: 400 }}>
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
              {ingenDeler ? (
                <Heading level="3" size="small" style={{ padding: '0.5rem' }} role="alert">
                  {t('hjelpemidler.sok.ingenDeler')}
                </Heading>
              ) : (
                <>
                  <DelKategoriVelger
                    setKategoriFilter={setKategoriFilter}
                    delKategorier={delKategorier}
                    kategoriFilter={kategoriFilter}
                    logKategoriValg={false}
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
                </>
              )}
            </Avstand>
          </div>
        </div>
      </Content>
    </main>
  )
}

export default Oversikt
