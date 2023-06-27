import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { Heading, Label, Pagination, Panel, Search, Select } from '@navikt/ds-react'
import DelKategoriVelger from '../components/DelKategoriVelger'
import useDelKategorier from '../hooks/useDelKategorier'
import Content from '../styledcomponents/Content'
import { Avstand } from '../components/Avstand'
import FlexedStack from '../styledcomponents/FlexedStack'
import DelInfo from '../components/DelInfo'
import { useTranslation } from 'react-i18next'
import HjelpemiddelKnapp from '../components/HjelpemiddelKnapp'
import { useHjelpemidler, useHjelpemidlerUtvalg } from '../hooks/useHjelpemidler'
import DelInnhold from '../components/DelInhold'
import styled from 'styled-components'
import { Del, Hjelpemiddel } from '../types/Types'
import { useMediaQuery } from '../hooks/useMediaQuery'

const SIZE_LARGE = 972

const OversiktInnhold = styled(Content)`
  display: flex;
  flex-direction: column;
  @media (min-width: ${SIZE_LARGE}px) {
    width: ${SIZE_LARGE}px;
    flex-direction: row;
  }
`

interface HjelpemiddelVelgerProps {
  hjelpemidler: Hjelpemiddel[]
  aktivtHjelpemiddel: Hjelpemiddel | undefined
  setAktivtHjelpemiddel: Dispatch<SetStateAction<Hjelpemiddel | undefined>>
}

const HjelpemiddelVelger = ({ aktivtHjelpemiddel, setAktivtHjelpemiddel, hjelpemidler }: HjelpemiddelVelgerProps) => {
  const { t } = useTranslation()

  const oppdaterAktivtHjelpemiddel = useCallback(
    (navn: string) => {
      const nesteAktiveHjelpemiddel = hjelpemidler.find((hjelpemiddelKategori) => hjelpemiddelKategori.navn === navn)
      setAktivtHjelpemiddel(nesteAktiveHjelpemiddel)
    },
    [hjelpemidler, setAktivtHjelpemiddel]
  )

  return (
    <Avstand marginLeft={4} marginRight={4} marginBottom={4}>
      <Select
        label={t('visuellOversikt.velgHjelpemiddel')}
        onChange={(e) => oppdaterAktivtHjelpemiddel(e.target.value)}
        value={aktivtHjelpemiddel?.navn}
      >
        {hjelpemidler.map(({ navn, deler }, index) => {
          const antallTilgjengeligeDeler = deler?.length || 0
          const delerText =
            antallTilgjengeligeDeler == 0
              ? t('hjelpemidler.sok.ingenDeler')
              : antallTilgjengeligeDeler == 1
              ? `1 ${t('hjelpemidler.sok.del')} del`
              : `${antallTilgjengeligeDeler} ${t('hjelpemidler.sok.deler')}`
          return (
            <option key={index} value={navn}>
              {navn} ({delerText})
            </option>
          )
        })}
      </Select>
    </Avstand>
  )
}

const HjelpemiddelVelgerMedSøk = ({
  aktivtHjelpemiddel,
  setAktivtHjelpemiddel,
  hjelpemidler,
}: HjelpemiddelVelgerProps) => {
  const { t } = useTranslation()
  const [søkeUtrykk, setSøkeUtrykk] = useState('')
  const { side, setSide, antallSider, hjelpemidlerUtvalg } = useHjelpemidlerUtvalg(
    aktivtHjelpemiddel,
    hjelpemidler,
    søkeUtrykk
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 400 }}>
      <Label>{t('visuellOversikt.søkEtterHjelpemiddel')}</Label>
      <Search label="Typesøk" onChange={setSøkeUtrykk} variant="simple" value={søkeUtrykk} />
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
            onPageChange={(side) => setSide(side)}
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
  )
}

interface DelListeProps {
  deler: Del[] | undefined
}

const DelListe = ({ deler }: DelListeProps) => {
  const { setKategoriFilter, kategoriFilter, delKategorier } = useDelKategorier(deler)
  return (
    <>
      <DelKategoriVelger
        setKategoriFilter={setKategoriFilter}
        delKategorier={delKategorier}
        kategoriFilter={kategoriFilter}
        logKategoriValg={false}
      />
      <Avstand paddingBottom={4} />
      {deler
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
  )
}

const Oversikt = () => {
  const { t } = useTranslation()
  const { aktivtHjelpemiddel, setAktivtHjelpemiddel, hjelpemidler } = useHjelpemidler()
  const ingenDeler = !!aktivtHjelpemiddel && aktivtHjelpemiddel.deler?.length === 0
  const brukLitenVersjon = useMediaQuery(`(max-width: ${SIZE_LARGE}px)`)
  return (
    <main>
      <OversiktInnhold>
        {brukLitenVersjon ? (
          <HjelpemiddelVelger
            hjelpemidler={hjelpemidler}
            aktivtHjelpemiddel={aktivtHjelpemiddel}
            setAktivtHjelpemiddel={setAktivtHjelpemiddel}
          />
        ) : (
          <HjelpemiddelVelgerMedSøk
            hjelpemidler={hjelpemidler}
            aktivtHjelpemiddel={aktivtHjelpemiddel}
            setAktivtHjelpemiddel={setAktivtHjelpemiddel}
          />
        )}
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
              <DelListe deler={aktivtHjelpemiddel?.deler} />
            )}
          </Avstand>
        </div>
      </OversiktInnhold>
    </main>
  )
}

export default Oversikt
