import React, { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { Heading, Panel } from '@navikt/ds-react'

import { useHjelpemidler } from '../hooks/useHjelpemidler'
import { LenkeMedLogging } from './Lenke'

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
        <li>
          <Trans
            i18nKey={'info.oversiktOverDeler'}
            components={{
              link: (
                <LenkeMedLogging
                  href="/hjelpemidler/delbestilling/oversikt"
                  lenketekst={t('info.oversiktOverDeler.lenketekst')}
                />
              ),
            }}
          />
        </li>
      </ul>
    </Panel>
  )
}

export default OmÅBestilleDeler
