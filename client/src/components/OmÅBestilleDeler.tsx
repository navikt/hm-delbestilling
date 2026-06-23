import { useTranslation } from 'react-i18next'
import { BodyShort, Heading } from '@navikt/ds-react'
import { CustomBox } from './Layout/CustomBox'

const OmÅBestilleDeler = () => {
  const { t } = useTranslation()

  return (
    <CustomBox>
      <Heading level="2" size="medium" spacing>
        {t('info.omÅBestilleDeler.tittel')}
      </Heading>
      <BodyShort>{t('info.omÅBestilleDeler.beskrivelse')}</BodyShort>
    </CustomBox>
  )
}

export default OmÅBestilleDeler
