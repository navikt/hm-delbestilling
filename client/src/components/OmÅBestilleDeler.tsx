import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BodyLong, Heading, Panel } from '@navikt/ds-react'

import { useHjelpemidler } from '../hooks/useHjelpemidler'

const OmÅBestilleDeler = () => {
  const { t } = useTranslation()
  const { hjelpemidler } = useHjelpemidler()
  const [typer, setTyper] = useState<string[]>([])

  // Lag en liste over de typene av hjelpemidler vi har i sortimentet vårt som også vi har deler til.
  useEffect(() => {
    const typerMedDeler = hjelpemidler.reduce((acc, curr) => {
      if (!acc.includes(curr.type) && curr.deler && curr.deler.length > 0) {
        acc.push(curr.type)
      }
      return acc
    }, [] as string[])
    setTyper(typerMedDeler)
  }, [hjelpemidler])

  return (
    <Panel>
      <Heading level="2" size="medium" spacing>
        {t('info.omÅBestilleDeler')}
      </Heading>
      <ul>
        <li>{t('info.kunForTeknikere')}</li>
        {typer.length > 0 && (
          <li>
            {t('info.kanBestilleDelerTil')} {typer.join(', ')}.
          </li>
        )}
      </ul>
    </Panel>
  )
}

export default OmÅBestilleDeler
