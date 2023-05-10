import React, { useMemo, useState } from 'react'
import { BodyShort, Button, Chips, Heading, Panel } from '@navikt/ds-react'
import { PencilIcon } from '@navikt/aksel-icons'
import HjelpemiddelLookup from '../components/HjelpemiddelLookup'
import Content from '../styledcomponents/Content'
import Header from '../styledcomponents/Header'
import { Avstand } from '../components/Avstand'
import { Handlekurv, Del, Hjelpemiddel } from '../types/Types'
import { useNavigate } from 'react-router-dom'

const Index = () => {
  const [artNr, setArtNr] = useState('222222')
  const [serieNr, setSerieNr] = useState('123123')
  const [hjelpemiddel, setHjelpemiddel] = useState<Hjelpemiddel | undefined>(undefined)
  const [kategoriFilter, setKategoriFilter] = useState<string | undefined>()

  const navigate = useNavigate()

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

  const handleBestill = (hjelpemiddel: Hjelpemiddel, del: Del) => {
    console.log('hjelpemiddel:', hjelpemiddel)
    console.log('del:', del)

    const handlekurv: Handlekurv = {
      serieNr,
      deler: [{ ...del, antall: 1 }],
    }

    window.localStorage.setItem('hm-delbestilling-session', JSON.stringify({ hjelpemiddel, handlekurv }))

    navigate('/utsjekk')
  }

  return (
    <>
      <Header>
        <Content>
          <Heading level="1" size="xlarge">
            Bestill del til hjelpemiddel
          </Heading>
        </Content>
      </Header>
      <main>
        <Content>
          <Heading level="2" size="medium" spacing>
            Bestill del
          </Heading>
          {!hjelpemiddel && (
            <HjelpemiddelLookup
              artNr={artNr}
              setArtNr={setArtNr}
              serieNr={serieNr}
              setSerieNr={setSerieNr}
              setHjelpemiddel={setHjelpemiddel}
            />
          )}
          {hjelpemiddel && (
            <>
              <Panel>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <Heading size="xsmall" level="4" spacing>
                    Bestill del til {hjelpemiddel.navn}
                  </Heading>
                  <Button
                    icon={<PencilIcon />}
                    variant="tertiary"
                    onClick={() => {
                      setKategoriFilter(undefined)
                      setHjelpemiddel(undefined)
                    }}
                  >
                    Endre
                  </Button>
                </div>
                <BodyShort>
                  <strong>Art.nr:</strong> {artNr} | <strong>Serienr:</strong> {serieNr}
                </BodyShort>
              </Panel>
              <Avstand marginBottom={6} />
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
                      <Button variant="secondary" onClick={() => handleBestill(hjelpemiddel, del)}>
                        Bestill
                      </Button>
                    </Panel>
                  </Avstand>
                ))}
            </>
          )}
        </Content>
      </main>
    </>
  )
}

export default Index
