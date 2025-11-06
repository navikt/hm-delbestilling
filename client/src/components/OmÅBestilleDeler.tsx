import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Accordion, BodyShort, Box, Heading, HStack, List, Loader, Skeleton } from '@navikt/ds-react'
import useSWRImmutable from 'swr/immutable'

import rest, { API_PATH } from '../services/rest'
import { TilgjengeligeHjelpemidlerResponse } from '../types/HttpTypes'
import { Avstand } from './Avstand'

const OmÅBestilleDeler = () => {
  const { t } = useTranslation()
  const [henterHjelpemidler, setHenterHjelpemidler] = useState(false)
  const [tilgjengeligeHjelpemidler, setTilgjengeligeHjelpemidler] = useState<
    TilgjengeligeHjelpemidlerResponse | undefined
  >(undefined)
  const [åpneHjelpemidler, setÅpneHjelpemidler] = useState<string[]>([])

  // Lag en liste over de hjelpemidlene vi har i sortimentet vårt som også vi har deler til.
  useEffect(() => {
    setHenterHjelpemidler(true)
    rest
      .hentTilgjengeligeHjelpemidler()
      .then((resp) => {
        setTilgjengeligeHjelpemidler(resp)
      })
      .finally(() => {
        setHenterHjelpemidler(false)
      })
  }, [])

  console.log('åpneHjelpemidler:', åpneHjelpemidler)

  return (
    <Box.New padding="4" background="default" borderRadius="12">
      <Heading level="2" size="medium" spacing>
        {t('info.omÅBestilleDeler')}
      </Heading>
      {henterHjelpemidler ? (
        <>
          <Skeleton variant="text" height="60px" style={{ transform: 'scale(1, 0.8' }}></Skeleton>
          <Skeleton variant="text" height="60px" style={{ transform: 'scale(1, 0.8' }}></Skeleton>
        </>
      ) : (
        <>
          <BodyShort>
            {t('info.kunForTeknikere')} {t('info.kanBestilleDelerTil')}:
          </BodyShort>
          <Avstand marginBottom={4}></Avstand>
          <Accordion>
            {tilgjengeligeHjelpemidler &&
              Object.entries(tilgjengeligeHjelpemidler).map(([tittel, hmsnrs], i) => (
                <Accordion.Item
                  key={tittel}
                  onOpenChange={(open) => {
                    if (open) {
                      setÅpneHjelpemidler((prev) => [...prev, tittel])
                    } else {
                      setÅpneHjelpemidler((prev) => prev.filter((p) => p !== tittel))
                    }
                  }}
                  open={åpneHjelpemidler.includes(tittel)}
                >
                  <Accordion.Header>{tittel}</Accordion.Header>
                  <Accordion.Content>
                    {åpneHjelpemidler.includes(tittel) && <DelerListe tittel={tittel} hmsnrs={hmsnrs} />}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
          </Accordion>
        </>
      )}
    </Box.New>
  )
}

const DelerListe = ({ tittel, hmsnrs }: { tittel: string; hmsnrs: string[] }) => {
  const { data, error, isLoading } = useSWRImmutable<string[]>(tittel, async () => {
    const response = await fetch(`${API_PATH}/deler-til-hmsnrs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hmsnrs }),
    })

    if (!response.ok) {
      throw new Error('Feil ved henting av deler')
    }

    return await response.json()
  })

  if (isLoading) {
    return (
      <HStack align="center" justify="center">
        <Loader />
      </HStack>
    )
  }

  console.log('data:', data)

  if (error) {
    return <BodyShort>Feil ved henting av deler. Prøv igjen senere.</BodyShort>
  }

  if (!data || Object.keys(data || {}).length === 0) {
    return <BodyShort>Ingen deler funnet.</BodyShort>
  }

  return (
    <List>
      {data.map((del) => (
        <List.Item key={del}>{del}</List.Item>
      ))}
    </List>
  )
}

export default OmÅBestilleDeler
