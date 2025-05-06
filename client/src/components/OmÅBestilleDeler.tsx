import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BodyShort, Heading, HStack, List, Panel, Skeleton } from '@navikt/ds-react'

import rest from '../services/rest'

const OmÅBestilleDeler = () => {
  const { t } = useTranslation()
  const [henterHjelpemidler, setHenterHjelpemidler] = useState(false)
  const [titler, setTitler] = useState<string[]>([])

  // Lag en liste over de hjelpemidlene vi har i sortimentet vårt som også vi har deler til.
  useEffect(() => {
    setHenterHjelpemidler(true)
    rest
      .hentHjelpemiddelTitler()
      .then((resp) => {
        if (resp && resp.titler) {
          setTitler(resp.titler)
        }
      })
      .finally(() => {
        setHenterHjelpemidler(false)
      })
  }, [])

  var kolonne1: string[] = []
  var kolonne2: string[] = []
  if (titler.length) {
    const lengde = titler.length
    const splitAt = Math.round(lengde / 2)
    kolonne1.push(...titler.slice(0, splitAt))
    kolonne2.push(...titler.slice(splitAt, lengde))
  }

  return (
    <Panel>
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
          {kolonne1.length > 0 && kolonne2.length > 0 && (
            <HStack gap="4">
              <List>
                {kolonne1.map((navn, i) => (
                  <List.Item key={i}>{navn}</List.Item>
                ))}
              </List>
              <List>
                {kolonne2.map((navn, i) => (
                  <List.Item key={i}>{navn}</List.Item>
                ))}
              </List>
            </HStack>
          )}
        </>
      )}
    </Panel>
  )
}

export default OmÅBestilleDeler
