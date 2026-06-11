import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ArrowLeftIcon } from '@navikt/aksel-icons'
import { Button, Heading, HStack } from '@navikt/ds-react'

import BestillingsListe from '../components/BestillingsListe/BestillingsListe'
import Content from '../components/Layout/Content'

const Bestillinger = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <main>
      <Content>
        <Button icon={<ArrowLeftIcon />} variant="tertiary" onClick={() => navigate('/')}>
          Tilbake
        </Button>
        <HStack justify="space-between" paddingBlock="space-12">
          <Heading size="large" level="2">
            {t('bestillinger.dineSiste')}
          </Heading>
          <Button onClick={() => navigate('/')}>{t('oversikt.nyBestilling')}</Button>
        </HStack>

        <BestillingsListe text={t('bestillinger.saker')} />
      </Content>
    </main>
  )
}

export default Bestillinger
