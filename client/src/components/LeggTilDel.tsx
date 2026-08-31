import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BodyLong, Box, Button, Detail, Heading, HStack, InfoCard, InlineMessage, Pagination, Search, Stack, TextField, VStack } from '@navikt/ds-react'

import FlexedStack from '../components/Layout/FlexedStack'
import { Del, Handlekurv, Hjelpemiddel, UkjentDel } from '../types/Types'

import { Beskrivelser } from './Beskrivelser/Beskrivelser'
import { Bilde } from './Bilde/Bilde'
import DelInnhold from './DelInhold/DelInhold'
import { CustomBox } from './Layout/CustomBox'
import { Avstand } from './Avstand'
import DelKategoriVelger, { useDelKategorier } from './DelKategoriVelger'
import InfoOmDel from './InfoOmDel'
import TilbehørSpørsmål, { TilbehorInfo } from './TilbehørSpørsmål'

import infoOmDelStyles from './InfoOmDel.module.css'
import { erGyldigArtnr, erGyldigLevartnr } from '../helpers/utils'
import { ArrowsCirclepathIcon } from '@navikt/aksel-icons'

interface Props {
  hjelpemiddel: Hjelpemiddel
  onLeggTil: (del: Del) => void
  onLeggTilUkjent: (del: UkjentDel) => void
  handlekurv: Handlekurv | undefined
}
const LeggTilDel = ({ hjelpemiddel, onLeggTil, onLeggTilUkjent, handlekurv }: Props) => {
  const { delKategorier, kategoriFilter, setKategoriFilter } = useDelKategorier(hjelpemiddel.deler)

  const { t } = useTranslation()
  const [søk, setSøk] = useState('')
  const [tilbehorInfo, setTilbehorInfo] = useState<Record<string, TilbehorInfo>>({})
  const [visHmsnrInputForUkjentDel, setVisHmsnrInputForUkjentDel] = useState(true)
  const [page, setPage] = useState(1)
  const [hmsnr, setHmsnr] = useState('')
  const [levArtNr, setLevArtNr] = useState('')
  const [beskrivelse, setBeskrivelse] = useState('')
  const [errorMessageUkjentDel, setErrorMessageUkjentDel] = useState<string | null>(null)
  const [submitAttempt, setSubmitAttempt] = useState(false)

  const pageSize = 10
  const errorMessageBeskrivelse = !visHmsnrInputForUkjentDel && !beskrivelse.trim()
    ? t('leggTilDel.ukjentDel.feilBeskrivelse')
    : null


  useEffect(() => { setPage(1) }, [kategoriFilter, søk])

  useEffect(() => {

    let nyErrorMessage = null

    if (visHmsnrInputForUkjentDel) {
      if (handlekurv?.ukjenteDeler.some((del) => del.delUkjent.hmsnr === hmsnr)) {
        nyErrorMessage = t('leggTilDel.ukjentDel.hmsnrAlleredeLagtTil')
      }

      if (hmsnr.length !== 6) {
        nyErrorMessage = t('leggTilDel.ukjentDel.feilHmsnr')
      }
    }

    if (!visHmsnrInputForUkjentDel) {
      if (handlekurv?.ukjenteDeler.some((del) => del.delUkjent.levArtNr === levArtNr)) {
        nyErrorMessage = t('leggTilDel.ukjentDel.levartnrAlleredeLagtTil')
      }

      if (levArtNr.length < 1) {
        nyErrorMessage = t('leggTilDel.ukjentDel.feilLevartnr')
      }
    }

    setErrorMessageUkjentDel(nyErrorMessage)
  }, [hmsnr, levArtNr, visHmsnrInputForUkjentDel, handlekurv])

  if (!hjelpemiddel.deler || hjelpemiddel.deler.length === 0) {
    return (
      <InfoCard data-color="accent">
        <InfoCard.Header>
          <InfoCard.Title>{t('leggTilDel.ingenDeler.tittel')}</InfoCard.Title>
        </InfoCard.Header>
        <InfoCard.Content>{t('leggTilDel.ingenDeler.innhold')}</InfoCard.Content>
      </InfoCard>
    )
  }

  console.log('Antall deler funnet:', hjelpemiddel.deler.length)

  const filtrerteDeler = hjelpemiddel.deler.filter((del) => (søk ? del.navn.toLowerCase().includes(søk.toLowerCase()) || del.hmsnr.includes(søk) : true))
    .filter((del) => (kategoriFilter ? del.kategori === kategoriFilter : true))

  const delerForSide = (deler: Del[], page: number) => {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    return deler.slice(startIndex, endIndex)
  }

  const antallSider = Math.ceil(filtrerteDeler.length / pageSize)

  return (
    <>
      <Heading size="medium" level="3" spacing>
        Deler til {hjelpemiddel.navn}
      </Heading>

      <Avstand marginBottom={8}>
        <DelKategoriVelger
          setKategoriFilter={setKategoriFilter}
          delKategorier={delKategorier}
          kategoriFilter={kategoriFilter}
          onKategoriClick={() => setSøk('')}
        />

        <Avstand marginBottom={16} />

        <HStack justify="start" align="end" gap="space-4">
          <div>
            <Search
              label="Søk"
              variant="simple"
              hideLabel
              value={søk}
              onChange={(val) => {
                setSøk(val)
                if (val) {
                  setKategoriFilter(undefined)
                }
              }}
            />
          </div>
        </HStack>
      </Avstand>

      {delerForSide(filtrerteDeler, page)
        .map((del) => {
          const erFastLagervare = del.lagerstatus.minmax
          const erBatteri = del.kategori.toLowerCase() === 'batteri'

          // Batteri er i seg selv dekket av garanti i 1 år
          const harNyligBlittBestiltBatteri =
            erBatteri &&
            hjelpemiddel.antallDagerSidenSistBatteribestilling !== null &&
            hjelpemiddel.antallDagerSidenSistBatteribestilling < 365

          // Dersom hjelpemiddelet er innenfor garantitiden, så kan batteriet være dekket av garantien
          const dekketAvHjelpemiddeletsGaranti = erBatteri && hjelpemiddel.erInnenforGaranti === true

          const erDekketAvGaranti = harNyligBlittBestiltBatteri || dekketAvHjelpemiddeletsGaranti

          const kanBestilles = !erDekketAvGaranti

          const tilbehorSvar = tilbehorInfo[del.hmsnr]
          const kanBestilleTilbehor = del.erTilbehør ? tilbehorSvar?.harTilbehørFraFør === true : true

          return (
            <Avstand marginBottom={12} key={del.hmsnr}>
              <CustomBox>
                <DelInnhold>
                  <VStack gap="space-12">
                    <FlexedStack>
                      <Bilde imgs={del.imgs} navn={del.navn} />
                      <Beskrivelser>
                        <InfoOmDel del={del} erFastLagervare={erFastLagervare} />

                        {harNyligBlittBestiltBatteri && hjelpemiddel.antallDagerSidenSistBatteribestilling !== null ? (
                          <Avstand marginTop={20}>
                            <Detail textColor="subtle" className={infoOmDelStyles.utvidetBredde}>
                              {t('del.antallDagerSidenSistBatteribestilling', {
                                count: hjelpemiddel.antallDagerSidenSistBatteribestilling,
                              })}
                            </Detail>
                          </Avstand>
                        ) : dekketAvHjelpemiddeletsGaranti ? (
                          <Avstand marginTop={20}>
                            <Detail className={infoOmDelStyles.utvidetBredde}>
                              {t('del.hjelpemiddelErInnenforGarantitid')}
                            </Detail>
                          </Avstand>
                        ) : null}
                      </Beskrivelser>
                    </FlexedStack>
                    {del.erTilbehør && kanBestilles && (
                      <Avstand marginTop={16}>
                        <TilbehørSpørsmål
                          delId={del.hmsnr}
                          tilbehorInfo={tilbehorInfo}
                          setTilbehorInfo={setTilbehorInfo}
                        />
                      </Avstand>
                    )}
                  </VStack>

                  {kanBestilles && kanBestilleTilbehor && (
                    <Button variant="secondary" onClick={() => onLeggTil(del)}>
                      {t('bestillinger.bestill')}
                    </Button>
                  )}
                </DelInnhold>
              </CustomBox>
            </Avstand>
          )
        })}
      {antallSider > 1 && <Pagination
        page={page}
        onPageChange={setPage}
        count={antallSider}
        boundaryCount={1}
        siblingCount={1}
        prevNextTexts
      />
      }
      <Avstand marginTop={16} />
      <Box padding="space-24" background="neutral-soft" borderWidth="1" borderRadius="12" borderColor="neutral-subtleA">

        <HStack justify="space-between" align="end" wrap={false} gap="space-8">

          <VStack gap="space-12">
            <Heading level="3" size="small">{t('bestillinger.finnerIkkeDel')}</Heading>
            <BodyLong textColor="subtle" size="small">{t('bestillinger.leggTilDelManuelt')}</BodyLong>
            {visHmsnrInputForUkjentDel ?
              (<>
                <HStack align="end" gap="space-8" wrap>
                  <TextField
                    style={{ width: '110px' }}
                    label={t('oppslag.artnr')}
                    value={hmsnr}
                    onChange={(e) => erGyldigArtnr(e.target.value) && setHmsnr(e.target.value)}
                    data-testid="input-artnr"
                    error={submitAttempt && errorMessageUkjentDel}
                  />
                  <Button icon={<ArrowsCirclepathIcon aria-hidden />} variant="tertiary" onClick={() => {
                    setHmsnr('')
                    setVisHmsnrInputForUkjentDel(false)
                  }}>
                    {t('oppslag.byttTilLevartnr')}
                  </Button>
                </HStack>
              </>)
              :
              (<>
                <HStack align="end" gap="space-8" wrap>
                  <TextField
                    style={{ width: '110px' }}
                    label={t('oppslag.levartnr')}
                    value={levArtNr}
                    onChange={(e) => erGyldigLevartnr(e.target.value) && setLevArtNr(e.target.value)}
                    data-testid="input-levartnr"
                    error={submitAttempt && errorMessageUkjentDel}
                  />
                  <Button icon={<ArrowsCirclepathIcon aria-hidden />} variant="tertiary" onClick={() => {
                    setLevArtNr('')
                    setBeskrivelse('')
                    setVisHmsnrInputForUkjentDel(true)
                  }}>
                    {t('oppslag.byttTilHmsnr')}
                  </Button>
                </HStack>
                <TextField
                  style={{ width: '400px', maxWidth: '100%' }}
                  label={t('leggTilDel.ukjentDel.beskrivelse')}
                  value={beskrivelse}
                  onChange={(e) => setBeskrivelse(e.target.value)}
                  maxLength={200}
                  data-testid="input-ukjent-del-beskrivelse"
                  error={submitAttempt && errorMessageBeskrivelse}
                />
              </>
              )
            }

            <InlineMessage status="info" size="small">
              {t('bestillinger.måManueltSaksbehandles')}
            </InlineMessage>
          </VStack>

          <Button variant="secondary" onClick={() => {
            setSubmitAttempt(true)
            if (!errorMessageUkjentDel && !errorMessageBeskrivelse) {
              onLeggTilUkjent({
                hmsnr: hmsnr || undefined,
                levArtNr: levArtNr || undefined,
                beskrivelse: visHmsnrInputForUkjentDel ? undefined : beskrivelse.trim(),
              })
            }
          }}>
            {t('bestillinger.bestill')}
          </Button>

        </HStack>

      </Box>

    </>

  )
}

const lagerTilEnhetnavnMap: { [key: string]: string } = {
  '01': 'Øst-Viken',
  '02': 'Oslo',
  '03': 'Oslo',
  '04': 'Elverum',
  '05': 'Gjøvik',
  '06': 'Vest-Viken',
  '07': 'Vestfold og Telemark',
  '08': 'Vestfold og Telemark',
  '09': 'Agder',
  '10': 'Agder',
  '11': 'Rogaland',
  '12': 'Vestland-Bergen',
  '14': 'Vestland-Førde',
  '15': 'Møre og Romsdal',
  '16': 'Trøndelag',
  '17': 'Trøndelag',
  '18': 'Nordland',
  '19': 'Troms og Finnmark',
  '20': 'Troms og Finnmark',
}

export default LeggTilDel
