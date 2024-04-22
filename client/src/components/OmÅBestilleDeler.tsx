import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BodyLong, Heading, Panel, Skeleton } from '@navikt/ds-react'

import { useHjelpemidler } from '../hooks/useHjelpemidler'

const OmÅBestilleDeler = () => {
  const { t } = useTranslation()
  const { hjelpemidler, henterHjelpemidler } = useHjelpemidler()
  const [navn, setNavn] = useState<string[]>([])

  // Lag en liste over de hjelpemidlene vi har i sortimentet vårt som også vi har deler til.
  useEffect(() => {
    const hjelpemidlerMedDeler = hjelpemidler.reduce((acc, curr) => {
      if (!acc.includes(curr.navn) && curr.deler && curr.deler.length > 0) {
        acc.push(curr.navn)
      }
      return acc
    }, [] as string[])
    setNavn(hjelpemidlerMedDeler)
  }, [hjelpemidler])

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
        <ul>
          <li>{t('info.kunForTeknikere')}</li>
          {navn.length > 0 && (
            <li>
              {t('info.kanBestilleDelerTil')} {navn.join(', ')}.
            </li>
          )}
        </ul>
      )}
    </Panel>
  )
}

export default OmÅBestilleDeler
