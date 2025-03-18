import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Heading, Panel, Skeleton } from '@navikt/ds-react'

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
          {titler.length > 0 && (
            <li>
              {t('info.kanBestilleDelerTil')} {titler.join(', ')}.
            </li>
          )}
        </ul>
      )}
    </Panel>
  )
}

export default OmÅBestilleDeler
